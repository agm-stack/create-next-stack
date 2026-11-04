"use client";
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";

import { cn } from "@/utils/styles";

type OTPFieldProps = Omit<OTPFieldPrimitive.Root.Props, "children" | "length"> & {
  length: number,
  /** Accessible name for every slot after the first, which uses the field label. */
  getSlotLabel: (position: number, length: number) => string,
  inputClassName?: string
};

/** One-time code input with one box per character (Base UI OTP Field). */
function OTPField({
  className, getSlotLabel, inputClassName, length, ...props
}: OTPFieldProps) {
  return (
    <OTPFieldPrimitive.Root
      className={cn("flex w-full justify-between gap-2", className)}
      data-slot="otp-field"
      length={length}
      {...props}
    >
      {Array.from({ length }, (_, index) => (
        <OTPFieldPrimitive.Input
          key={index}
          aria-label={index === 0 ? undefined : getSlotLabel(index + 1, length)}
          className={cn(
            `
              m-0 aspect-square w-full max-w-14 min-w-0 rounded-md border border-input bg-background p-0
              text-center font-mono text-xl font-semibold text-foreground caret-brand transition-colors
              outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20
              disabled:cursor-not-allowed disabled:opacity-50 data-filled:border-foreground/30
            `,
            inputClassName
          )}
          data-slot="otp-field-input"
        />
      ))}
    </OTPFieldPrimitive.Root>
  );
}

export { OTPField };
