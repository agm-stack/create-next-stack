"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/utils/styles";

function SegmentedControl<Value extends string>(
  props: ToggleGroup.Props<Value>,
) {
  const { className, ...rest } = props;

  return (
    <ToggleGroup
      className={cn(
        `
          inline-flex w-fit max-w-full items-center rounded-md border border-border bg-muted p-1
          data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch
        `,
        className,
      )}
      data-slot="segmented-control"
      {...rest}
    />
  );
}

function SegmentedControlItem<Value extends string>(
  props: Toggle.Props<Value>,
) {
  const { className, ...rest } = props;

  return (
    <Toggle
      className={cn(
        `
          relative z-0 inline-flex min-h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 py-1.5
          text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none
          hover:bg-background/60 hover:text-foreground
          focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
          data-pressed:z-10 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm
          data-[orientation=vertical]:w-full data-disabled:pointer-events-none data-disabled:cursor-not-allowed
          data-disabled:opacity-50
          [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0
        `,
        className,
      )}
      data-slot="segmented-control-item"
      {...rest}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
