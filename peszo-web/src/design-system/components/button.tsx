// Base UI is shadcn v4's default primitive library (replaced Radix in July 2026).
// Using the same base for all components avoids mixing two headless libraries.
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus:border-gold focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-base hover:bg-goldDefault",
        secondary:
          "bg-surface2 border-borderDefault text-textPrimary hover:border-borderStrong",
      },
      size: {
        default: "h-11 gap-1.5 px-4",
        sm: "h-8 gap-1 px-3 text-xs",
        lg: "h-12 gap-1.5 px-6",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
