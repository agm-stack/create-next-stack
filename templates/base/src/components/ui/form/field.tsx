"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/utils/styles";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return <FieldPrimitive.Root className={cn("flex flex-col items-start gap-2", className)} data-slot="field" {...props} />;
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      className={cn("inline-flex items-center gap-2 text-sm leading-4 font-medium text-foreground", className)}
      data-slot="field-label"
      {...props}
    />
  );
}
function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      className={cn("text-xs text-muted-foreground", className)}
      data-slot="field-description"
      {...props}
    />
  );
}
function FieldError({
  children,
  className,
  match,
  ...props
}: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      {...props}
      className={cn("text-xs text-destructive", className)}
      data-slot="field-error"
      match={match ?? (children !== undefined ? true : undefined)}
    >
      {children}
    </FieldPrimitive.Error>
  );
}
const FieldControl = FieldPrimitive.Control;
const FieldValidity = FieldPrimitive.Validity;
export {
  Field, FieldControl, FieldDescription, FieldError, FieldLabel, FieldValidity
};
