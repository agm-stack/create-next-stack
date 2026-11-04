"use client";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { type VariantProps, cva } from "class-variance-authority";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/utils/styles";

const switchVariants = cva(
  `
    group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full border border-input bg-muted
    p-px transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring
    focus-visible:ring-offset-2 focus-visible:ring-offset-background data-unchecked:bg-muted
    data-disabled:cursor-not-allowed data-disabled:opacity-50
  `,
  {
    defaultVariants: {
      size: "default",
      color: "primary",
    },
    variants: {
      size: {
        sm: "h-5 w-8.5",
        default: "h-5.5 w-9.5",
        lg: "h-7 w-12",
      },
      color: {
        accent:
          "data-checked:bg-accent data-checked:text-accent-foreground hover:data-checked:bg-accent/80",
        brand:
          "data-checked:bg-brand data-checked:text-brand-foreground hover:data-checked:bg-brand/90",
        destructive:
          "data-checked:bg-destructive data-checked:text-destructive-foreground hover:data-checked:bg-destructive/90",
        primary:
          "data-checked:bg-primary data-checked:text-primary-foreground hover:data-checked:bg-primary/90",
        secondary:
          "data-checked:bg-secondary data-checked:text-secondary-foreground hover:data-checked:bg-secondary/80",
        success:
          "data-checked:bg-success data-checked:text-success-foreground hover:data-checked:bg-success/90",
        warning:
          "data-checked:bg-warning data-checked:text-warning-foreground hover:data-checked:bg-warning/90",
      },
    },
  }
);

const thumbVariants = cva(
  `
    pointer-events-none block rounded-full border border-border bg-background
    transition-[translate,width] dark:border-background dark:bg-foreground data-unchecked:translate-x-0
  `,
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        sm: "size-4.5 group-active/switch:not-data-disabled:w-5 data-checked:translate-x-3.5 data-checked:group-active/switch:translate-x-3",
        default: `
          size-5
          group-active/switch:not-data-disabled:w-5.5
          data-checked:translate-x-4
          data-checked:group-active/switch:translate-x-3.5
        `,
        lg: "size-6 group-active/switch:not-data-disabled:w-7 data-checked:translate-x-5 data-checked:group-active/switch:translate-x-4.5",
      },
    },
  }
);

export type SwitchProps = SwitchPrimitive.Root.Props &
  VariantProps<typeof switchVariants> & {
    label?: string,
    description?: string,
    classNames?: {
      wrapper?: string,
      label?: string,
      description?: string,
      switch?: string,
      thumb?: string
    }
  };

function Switch(props: SwitchProps) {
  const {
    className, classNames, color, description, disabled, id: idProp, label, size, ...rest
  } = props;
  const generatedId = useId();
  const id = idProp || generatedId;

  const switchComponent = (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ size, color }), className, classNames?.switch)}
      data-slot="switch"
      disabled={disabled}
      id={id}
      {...rest}
    >
      <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }), classNames?.thumb)} data-slot="switch-thumb" />
    </SwitchPrimitive.Root>
  );

  if (!label && !description) {
    return switchComponent;
  }

  return (
    <div className={cn("flex items-start gap-2", classNames?.wrapper)}>
      {switchComponent}
      <div className={cn("flex flex-col gap-1", disabled && "opacity-50")}>
        {label && (
          <Label className={cn(disabled ? "cursor-not-allowed" : "cursor-pointer", classNames?.label)} htmlFor={id}>
            {label}
          </Label>
        )}
        {description && <p className={cn("text-xs text-muted-foreground", classNames?.description)}>{description}</p>}
      </div>
    </div>
  );
}
export { Switch };
