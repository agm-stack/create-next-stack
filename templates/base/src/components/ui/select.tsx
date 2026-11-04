"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { type VariantProps, cva } from "class-variance-authority";
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/utils/styles";

import type * as React from "react";

const Select = SelectPrimitive.Root;

const selectTriggerVariants = cva(
  `
    relative inline-flex h-9 min-h-0 w-full min-w-36 items-center justify-between gap-2 rounded-md border border-input bg-background
    px-3 py-0 text-left text-sm leading-none text-foreground transition-colors outline-none select-none
    focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20
    aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20
    sm:h-8 sm:text-sm
    data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:shrink-0
    [&_svg:not([class*='size-'])]:size-4
    sm:[&_svg:not([class*='size-'])]:size-4
  `,
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "",
        lg: "h-10 sm:h-9",
        sm: "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:h-7",
      },
    },
  }
);

const selectTriggerIconClassName = "-me-1 size-4.5 opacity-80 sm:size-4";

type SelectButtonProps = {
  size?: VariantProps<typeof selectTriggerVariants>["size"]
} & useRender.ComponentProps<"button">;

function SelectButton({
  children, className, render, size, ...props
}: SelectButtonProps) {
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] = render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        <span className="flex-1 truncate in-data-placeholder:text-muted-foreground/72">{children}</span>
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </>
    ),
    className: cn(selectTriggerVariants({ size }), "min-w-0", className),
    "data-slot": "select-button",
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}

function SelectTrigger({
  children,
  className,
  size = "default",
  ...props
}: SelectPrimitive.Trigger.Props & VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger className={cn(selectTriggerVariants({ size }), className)} data-slot="select-trigger" {...props}>
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      className={cn("flex-1 truncate data-placeholder:text-muted-foreground", className)}
      data-slot="select-value"
      {...props}
    />
  );
}

function SelectPopup({
  align = "start",
  alignItemWithTrigger = true,
  alignOffset = 0,
  anchor,
  children,
  className,
  side = "bottom",
  sideOffset = 4,
  startContent,
  ...props
}: SelectPrimitive.Popup.Props & {
  side?: SelectPrimitive.Positioner.Props["side"],
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"],
  align?: SelectPrimitive.Positioner.Props["align"],
  alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"],
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"],
  anchor?: SelectPrimitive.Positioner.Props["anchor"],
  startContent?: React.ReactNode
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className="origin-(--transform-origin) rounded-md border border-border bg-popover text-popover-foreground shadow-md"
          data-slot="select-popup"
          {...props}
        >
          {startContent ? (
            <div className="flex max-h-(--available-height) min-w-(--anchor-width)">
              <div className="shrink-0 border-e border-border">
                {startContent}
              </div>
              <div className="relative min-w-0 flex-1">
                <SelectPrimitive.ScrollUpArrow
                  className={`
                    top-0 z-50 flex h-6 w-full cursor-default items-center justify-center
                    before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%]
                    before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b before:from-popover before:from-50%
                  `}
                  data-slot="select-scroll-up-arrow"
                >
                  <ChevronUpIcon className="relative size-4.5 sm:size-4" />
                </SelectPrimitive.ScrollUpArrow>
                <div className="relative h-fit">
                  <SelectPrimitive.List
                    className={cn("max-h-(--available-height) overflow-y-auto p-1", className)}
                    data-slot="select-list"
                  >
                    {children}
                  </SelectPrimitive.List>
                </div>
                <SelectPrimitive.ScrollDownArrow
                  className={`
                    bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center
                    before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%]
                    before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t before:from-popover before:from-50%
                  `}
                  data-slot="select-scroll-down-arrow"
                >
                  <ChevronDownIcon className="relative size-4.5 sm:size-4" />
                </SelectPrimitive.ScrollDownArrow>
              </div>
            </div>
          ) : (
            <>
              <SelectPrimitive.ScrollUpArrow
                className={`
                  top-0 z-50 flex h-6 w-full cursor-default items-center justify-center
                  before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%]
                  before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b before:from-popover before:from-50%
                `}
                data-slot="select-scroll-up-arrow"
              >
                <ChevronUpIcon className="relative size-4.5 sm:size-4" />
              </SelectPrimitive.ScrollUpArrow>
              <div className="relative h-fit min-w-(--anchor-width)">
                <SelectPrimitive.List
                  className={cn("max-h-(--available-height) overflow-y-auto p-1", className)}
                  data-slot="select-list"
                >
                  {children}
                </SelectPrimitive.List>
              </div>
              <SelectPrimitive.ScrollDownArrow
                className={`
                  bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center
                  before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%]
                  before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t before:from-popover before:from-50%
                `}
                data-slot="select-scroll-down-arrow"
              >
                <ChevronDownIcon className="relative size-4.5 sm:size-4" />
              </SelectPrimitive.ScrollDownArrow>
            </>
          )}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ children, className, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={cn(
        `
          grid min-h-8 cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-sm outline-none
          in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)]
          data-highlighted:bg-accent data-highlighted:text-accent-foreground
          sm:min-h-7 data-disabled:pointer-events-none data-disabled:cursor-not-allowed
          data-disabled:opacity-50
          [&_svg]:pointer-events-none [&_svg]:shrink-0
          [&_svg:not([class*='size-'])]:size-4
        `,
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1">
        <svg
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2 min-w-0">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return <SelectPrimitive.Separator className={cn("mx-2 my-1 h-px bg-border", className)} data-slot="select-separator" {...props} />;
}

function SelectGroup(props: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectGroupLabel(props: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
      data-slot="select-group-label"
      {...props}
    />
  );
}

export {
  Select,
  SelectButton,
  SelectPopup as SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants
};
