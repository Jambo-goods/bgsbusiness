
// This is the shared toast hook
import { toast as sonnerToast } from "sonner";
import {
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast";

const TOAST_LIMIT = 5;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export const useToast = () => {
  return {
    toast: sonnerToast
  };
};

export const toast = sonnerToast;
