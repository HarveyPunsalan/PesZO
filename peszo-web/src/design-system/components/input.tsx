import * as React from "react"
// Base UI is shadcn v4's default primitive library (replaced Radix in July 2026).
// Using the same base for all components avoids mixing two headless libraries.
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/utils/cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-sm border border-borderDefault bg-surface1 px-3 py-2 text-sm text-textPrimary transition-colors outline-none placeholder:text-textMuted focus:border-gold focus:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
