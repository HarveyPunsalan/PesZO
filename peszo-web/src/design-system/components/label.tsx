import * as React from "react"

import { cn } from "@/utils/cn"

// Stock shadcn label uses text-foreground (CSS variable) which doesn't exist in our
// config. DESIGN.md specifies labels as secondary text, so this uses text-textSecondary.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium text-textSecondary select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
