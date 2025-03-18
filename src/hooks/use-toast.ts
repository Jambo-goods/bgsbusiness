
import { useState, useEffect } from "react";
import { toast as sonnerToast, type Toast } from "sonner";

export type ToastProps = Toast & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const { title, description, variant, ...rest } = props;
    
    // Use sonner toast as the implementation
    if (variant === "destructive") {
      return sonnerToast.error(title, {
        description,
        ...rest,
      });
    }
    
    return sonnerToast(title ?? "", {
      description,
      ...rest,
    });
  };

  toast.success = (title: string, props?: Omit<ToastProps, "title">) => {
    return sonnerToast.success(title, props);
  };

  toast.error = (title: string, props?: Omit<ToastProps, "title">) => {
    return sonnerToast.error(title, props);
  };

  toast.warning = (title: string, props?: Omit<ToastProps, "title">) => {
    return sonnerToast.warning(title, props);
  };

  toast.info = (title: string, props?: Omit<ToastProps, "title">) => {
    return sonnerToast.info(title, props);
  };

  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      }
    },
  };
}

export const toast = sonnerToast;
