
-- Add payment_id column to wallet_transactions table
ALTER TABLE wallet_transactions 
ADD COLUMN payment_id UUID,
ADD COLUMN project_id UUID;

-- Update the trigger function to account for the processed fields
ALTER FUNCTION public.process_scheduled_payment_yield()
RENAME TO process_scheduled_payment_yield_old;

-- Create the updated trigger function
CREATE OR REPLACE FUNCTION public.process_scheduled_payment_yield()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_name TEXT;
  user_record RECORD;
  investment_amount NUMERIC;
  yield_amount NUMERIC;
  percentage NUMERIC;
BEGIN
  -- Only proceed if status changed to 'paid'
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Get project name for reference
    SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;
    
    -- Get percentage from the payment record
    percentage := COALESCE(NEW.percentage, 0);
    
    -- Log the start of processing
    RAISE NOTICE 'Processing scheduled payment % for project % (%) at %% yield', 
                 NEW.id, NEW.project_id, project_name, percentage;
    
    -- Process for all users who have invested in this project
    FOR user_record IN 
      SELECT user_id, amount 
      FROM public.investments 
      WHERE project_id = NEW.project_id AND status = 'active'
    LOOP
      -- Calculate yield amount based on investment
      investment_amount := COALESCE(user_record.amount, 0);
      yield_amount := (investment_amount * percentage / 100)::NUMERIC;
      
      RAISE NOTICE 'Processing user %: Investment: %, Yield: %', 
                   user_record.user_id, investment_amount, yield_amount;
      
      -- Create wallet transaction for the yield
      INSERT INTO public.wallet_transactions (
        user_id, 
        amount, 
        type, 
        status, 
        description,
        payment_id,
        project_id
      ) VALUES (
        user_record.user_id,
        yield_amount,
        'yield',
        'completed',
        'Rendement ' || percentage || '% du projet ' || COALESCE(project_name, 'inconnu'),
        NEW.id,
        NEW.project_id
      ) ON CONFLICT DO NOTHING;
      
      -- Update wallet balance
      UPDATE public.profiles
      SET wallet_balance = wallet_balance + yield_amount
      WHERE id = user_record.user_id;
      
      -- Create notification for the user
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        seen,
        data
      ) VALUES (
        user_record.user_id,
        'Rendement reçu',
        'Vous avez reçu un rendement de ' || yield_amount || '€ pour le projet ' || COALESCE(project_name, 'inconnu'),
        'yield',
        false,
        jsonb_build_object(
          'project_id', NEW.project_id,
          'payment_id', NEW.id,
          'amount', yield_amount,
          'category', 'success'
        )
      ) ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Update the payment record to mark as processed
    UPDATE public.scheduled_payments
    SET 
      processed_at = NOW(),
      processed_investors_count = (SELECT COUNT(*) FROM public.investments WHERE project_id = NEW.project_id AND status = 'active'),
      processed_amount = (
        SELECT SUM((amount * percentage / 100)::NUMERIC) 
        FROM public.investments 
        WHERE project_id = NEW.project_id AND status = 'active'
      )
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Completed processing scheduled payment % for project %', NEW.id, NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add columns for tracking processed data
ALTER TABLE public.scheduled_payments 
ADD COLUMN IF NOT EXISTS processed_investors_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processed_amount NUMERIC DEFAULT 0;

-- Create or recreate the trigger
DROP TRIGGER IF EXISTS process_scheduled_payment_trigger ON public.scheduled_payments;

CREATE TRIGGER process_scheduled_payment_trigger
AFTER UPDATE ON public.scheduled_payments
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION public.process_scheduled_payment_yield();

-- Create a unique index to prevent duplicate payments
CREATE UNIQUE INDEX IF NOT EXISTS unique_yield_payment_per_user
ON public.wallet_transactions (user_id, payment_id, type)
WHERE type = 'yield';
