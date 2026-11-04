"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/utils/styles";

export type CheckboxProps = CheckboxPrimitive.Root.Props & {
  label?: React.ReactNode,
  description?: React.ReactNode,
  error?: boolean,
  classNames?: {
    wrapper?: string,
    content?: string,
    label?: string,
    description?: string,
    checkbox?: string,
    indicator?: string
  }
};

function Checkbox(props: CheckboxProps) {
  const {
    className, classNames, description, disabled, error, id: idProp, label, ...rest
  } = props;
  const generatedId = useId();
  const id = idProp || generatedId;

  const checkboxComponent = (
    <CheckboxPrimitive.Root
      aria-invalid={error}
      className={cn(
        `
          relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border
          border-input bg-background text-primary transition-colors outline-none
          hover:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:text-destructive
          data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground
          data-disabled:cursor-not-allowed data-disabled:opacity-50
        `,
        className,
        classNames?.checkbox
      )}
      data-slot="checkbox"
      disabled={disabled}
      id={id}
      {...rest}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          `
            absolute
            -inset-px
            flex
            items-center justify-center rounded-sm text-primary-foreground data-indeterminate:text-foreground data-checked:bg-primary
            data-unchecked:hidden
          `,
          classNames?.indicator
        )}
        data-slot="checkbox-indicator"
        render={(renderProps, state) => (
          <span {...renderProps}>
            {state.indeterminate ? (
              <svg
                className="size-3.5 sm:size-3"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.252 12h13.496" />
              </svg>
            ) : (
              <svg
                className="size-3.5 sm:size-3"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
              </svg>
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );

  if (!label && !description) {
    return checkboxComponent;
  }

  return (
    <div className={cn("flex items-center gap-2", classNames?.wrapper)}>
      {checkboxComponent}
      <div
        className={cn(
          "flex flex-col gap-1",
          disabled && "opacity-50",
          classNames?.content,
        )}
      >
        {label && (
          <Label
            className={cn(
              disabled ? "cursor-not-allowed" : "cursor-pointer",
              classNames?.label,
            )}
            htmlFor={id}
          >
            {label}
          </Label>
        )}
        {description && (
          <p
            className={cn(
              "text-xs text-muted-foreground",
              classNames?.description,
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export { Checkbox };
