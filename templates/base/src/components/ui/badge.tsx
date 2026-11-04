import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils/styles";

const badgeVariants = cva(
  `
    inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium
    whitespace-nowrap transition-colors
    [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        accent:
          "border-accent/30 bg-accent/15 text-accent-foreground",
        brand: "border-brand/30 bg-brand/10 text-brand",
        default: "border-border bg-card text-card-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        outline: "border-border bg-transparent text-foreground",
        secondary: "border-secondary bg-secondary text-secondary-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning:
          "border-warning/30 bg-warning/15 text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants> & {
    ref?: React.Ref<HTMLDivElement>
  };

function Badge({ className, ref, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
