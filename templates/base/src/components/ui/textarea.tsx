"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";

import { cn } from "@/utils/styles";

export type TextareaProps = React.ComponentProps<"textarea"> & {
  size?: "sm" | "default" | "lg" | number,
  textareaClassName?: string,
  unstyled?: boolean
};

function Textarea({
  className,
  size = "default",
  textareaClassName,
  unstyled = false,
  ...props
}: TextareaProps) {
  return (
    <span
      className={
        cn(
          !unstyled &&
            `
              relative inline-flex w-full min-w-0 rounded-md border border-input bg-background text-sm
              transition-colors has-focus-visible:border-ring has-focus-visible:ring-2
              has-focus-visible:ring-ring/20 has-disabled:cursor-not-allowed has-disabled:opacity-50
              has-aria-invalid:border-destructive has-aria-invalid:ring-2
              has-aria-invalid:ring-destructive/20
            `,
          className
        ) || undefined
      }
      data-size={size}
      data-slot="textarea-control"
    >
      <FieldPrimitive.Control
        render={(defaultProps) => (
          <textarea
            className={cn(
              `
                field-sizing-content min-h-20.5 w-full min-w-0 rounded-[inherit] bg-transparent px-3 py-2
                text-sm wrap-anywhere text-foreground outline-none placeholder:text-muted-foreground
                disabled:cursor-not-allowed
              `,
              size === "sm" && "min-h-16 px-2.5 py-1.5",
              size === "lg" && "min-h-24 px-3.5 py-2.5",
              textareaClassName,
            )}
            data-slot="textarea"
            {...mergeProps(defaultProps, props)}
          />
        )}
      />
    </span>
  );
}

export { Textarea };
