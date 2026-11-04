"use client";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/utils/styles";

export type InputProps = Omit<
  InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
  "size" | "style"
> & {
  size?: "sm" | "default" | "lg" | number,
  style?: React.CSSProperties,
  unstyled?: boolean,
  nativeInput?: boolean
};

function Input({
  className, nativeInput = false, size = "default", unstyled = false, ...props
}: InputProps) {
  const inputClassName = cn(
    `
      h-9 w-full min-w-0 rounded-[inherit] border-0 bg-transparent px-3 text-sm leading-9
      text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0
      disabled:cursor-not-allowed
    `,
    size === "sm" && "h-8 px-2.5 leading-8",
    size === "lg" && "h-10 px-3.5 leading-10",
    props.type === "search" &&
      `
        [&::-webkit-search-cancel-button]:appearance-none
        [&::-webkit-search-decoration]:appearance-none
        [&::-webkit-search-results-button]:appearance-none
        [&::-webkit-search-results-decoration]:appearance-none
      `,
    props.type === "file" && "text-muted-foreground file:me-3 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    className
  );

  return (
    <span
      className={cn(
        !unstyled &&
          `
            relative inline-flex w-full rounded-md border border-input bg-background text-sm
            transition-colors has-focus-visible:border-ring has-focus-visible:ring-2
            has-focus-visible:ring-ring/20 has-disabled:cursor-not-allowed has-disabled:opacity-50
            has-aria-invalid:border-destructive has-aria-invalid:ring-2 has-aria-invalid:ring-destructive/20
          `,
        className
      )}
      data-size={size}
      data-slot="input-control"
    >
      {nativeInput ? (
        <input className={inputClassName} data-slot="input" size={typeof size === "number" ? size : undefined} {...props} />
      ) : (
        <InputPrimitive className={inputClassName} data-slot="input" size={typeof size === "number" ? size : undefined} {...props} />
      )}
    </span>
  );
}

export { Input };
