import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, size = "md", showPercentage = false, ...props }, ref) => {
  const heightClass = 
    size === "sm" ? "h-2" : 
    size === "lg" ? "h-6" : 
    "h-4";
  
  return (
    <div className="relative">
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
        >
          {showPercentage && size === "lg" && (
            <span className="text-xs font-medium text-white">{value}%</span>
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
      {showPercentage && size !== "lg" && (
        <span className="absolute top-0 right-0 -mt-6 text-xs font-medium text-bgs-blue">{value}%</span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
