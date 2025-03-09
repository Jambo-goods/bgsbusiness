
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, size = "md", ...props }, ref) => {
  const heightClass = 
    size === "sm" ? "h-2" : 
    size === "lg" ? "h-6" : 
    "h-4";
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        `relative w-full overflow-hidden rounded-full bg-secondary`,
        heightClass,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          `h-full w-full flex-1 transition-all`,
          size === "lg" ? "flex items-center justify-end pr-2" : "",
          indicatorClassName || "bg-gradient-to-r from-bgs-orange to-bgs-orange-light"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
