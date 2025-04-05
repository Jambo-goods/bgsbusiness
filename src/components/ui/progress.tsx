import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  size?: "sm" | "md" | "lg";
}
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(({
  className,
  value,
  indicatorClassName,
  size = "md",
  ...props
}, ref) => {
  const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-6" : "h-4";
  return;
});
Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };