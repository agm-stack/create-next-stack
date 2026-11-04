"use client";

import { cva } from "class-variance-authority";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/styles";

import type { InputProps } from "@/components/ui/input";
import type { TextareaProps } from "@/components/ui/textarea";
import type { VariantProps } from "class-variance-authority";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        `
          relative inline-flex w-full min-w-0 items-center rounded-md border border-input bg-background text-sm
          transition-colors
          has-data-[align=block-end]:h-auto has-data-[align=block-end]:flex-col
          has-data-[align=block-start]:h-auto has-data-[align=block-start]:flex-col
          has-[input:disabled,textarea:disabled]:cursor-not-allowed has-[input:disabled,textarea:disabled]:opacity-50
          has-[input:focus-visible,textarea:focus-visible]:border-ring has-[input:focus-visible,textarea:focus-visible]:outline-1
          has-[input:focus-visible,textarea:focus-visible]:outline-ring/50
          has-[input[aria-invalid],textarea[aria-invalid]]:border-destructive
          has-[input:focus-visible,textarea:focus-visible]:has-[input[aria-invalid],textarea[aria-invalid]]:border-destructive
          has-[input:focus-visible,textarea:focus-visible]:has-[input[aria-invalid],textarea[aria-invalid]]:outline-destructive
          has-[textarea]:h-auto
          has-data-[align=inline-end]:**:[[data-size=sm]_input]:pe-1.5
          has-data-[align=inline-start]:**:[[data-size=sm]_input]:ps-1.5
          *:[[data-slot=input-control],[data-slot=textarea-control]]:contents
          *:[[data-slot=input-control],[data-slot=textarea-control]]:before:hidden
          has-data-[align=block-end]:**:[input]:pt-1.5
          has-data-[align=block-start]:**:[input]:pb-1.5
          has-data-[align=inline-end]:**:[input]:pe-2
          has-data-[align=inline-start]:**:[input]:ps-2
          has-[[data-align=block-start],[data-align=block-end]]:**:[input]:h-auto
          **:[textarea_button]:rounded-[calc(var(--radius-md)-1px)]
          **:[textarea]:min-h-20.5 **:[textarea]:resize-none **:[textarea]:py-[calc(--spacing(3)-1px)]
          **:[textarea]:max-sm:min-h-23.5
        `,
        className
      )}
      data-slot="input-group"
      role="group"
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  `
    flex h-auto cursor-text items-center justify-center gap-2 text-muted-foreground select-none
    [&_svg]:-mx-0.5
    in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5
    sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4
    not-has-[button]:**:[svg:not([class*='opacity-'])]:opacity-80
    [&>kbd]:rounded-[calc(var(--radius)-5px)]
  `,
  {
    defaultVariants: {
      align: "inline-start",
    },
    variants: {
      align: {
        "block-end": `
          order-last w-full justify-start px-[calc(--spacing(3)-1px)] pb-[calc(--spacing(3)-1px)]
          [.border-t]:pt-[calc(--spacing(3)-1px)]
          [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]
        `,
        "block-start": `
          order-first w-full justify-start px-[calc(--spacing(3)-1px)] pt-[calc(--spacing(3)-1px)]
          [.border-b]:pb-[calc(--spacing(3)-1px)]
          [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]
        `,
        "inline-end": `
          order-last pe-[calc(--spacing(3)-1px)]
          has-[>:last-child[data-slot=badge]]:-me-1.5
          has-[>button]:-me-2
          has-[>kbd:last-child]:me-[-0.35rem]
          [[data-size=sm]+&]:pe-[calc(--spacing(2.5)-1px)]
        `,
        "inline-start": `
          order-first ps-[calc(--spacing(3)-1px)]
          has-[>:last-child[data-slot=badge]]:-ms-1.5
          has-[>button]:-ms-2
          has-[>kbd:last-child]:ms-[-0.35rem]
          [[data-size=sm]+&]:ps-[calc(--spacing(2.5)-1px)]
        `,
      },
    },
  }
);

function InputGroupAddon({
  align = "inline-start",
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest("button, a");
        if (isInteractive) return;
        e.preventDefault();
        const parent = e.currentTarget.parentElement;
        const input = parent?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
        if (input && !parent?.querySelector("input:focus, textarea:focus")) {
          input.focus();
        }
      }}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        `
          line-clamp-1 flex items-center gap-2 text-muted-foreground
          [&_svg]:pointer-events-none [&_svg]:-mx-0.5
          in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5
          sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4
        `,
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: InputProps) {
  return <Input unstyled className={className} {...props} />;
}

function InputGroupTextarea({ className, ...props }: TextareaProps) {
  return <Textarea unstyled className={className} {...props} />;
}

export {
  InputGroup, InputGroupAddon, InputGroupInput, InputGroupText, InputGroupTextarea
};
