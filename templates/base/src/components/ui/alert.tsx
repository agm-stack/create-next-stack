import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils/styles";

const alertVariants = cva(
  `
    relative grid w-full grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-md border p-4 text-sm
    [&>svg]:row-span-2 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0
    [&>svg~*]:col-start-2
  `,
  {
    variants: {
      variant: {
        default:
          "border-border bg-card text-card-foreground [&>svg]:text-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-foreground [&>svg]:text-destructive",
        info: "border-brand/30 bg-brand/10 text-foreground [&>svg]:text-brand",
        success:
          "border-success/30 bg-success/10 text-foreground [&>svg]:text-success",
        warning:
          "border-warning/30 bg-warning/10 text-foreground [&>svg]:text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    ref?: React.Ref<HTMLDivElement>
  };

type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>
};

type AlertTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>
};

function Alert({
  className,
  ref,
  role,
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      ref={ref}
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role={role ?? (variant === "destructive" ? "alert" : "status")}
      {...props}
    />
  );
}

function AlertTitle({ className, ref, ...props }: AlertTitleProps) {
  return (
    <div
      ref={ref}
      className={cn("leading-none font-medium tracking-tight", className)}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({ className, ref, ...props }: AlertDescriptionProps) {
  return (
    <div
      ref={ref}
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      data-slot="alert-description"
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
export type { AlertProps };
