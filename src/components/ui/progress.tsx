import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  color?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800',
          className
        )}
        {...props}
      >
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color || '#f97316',
          }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
