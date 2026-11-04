"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "@/utils/styles";

function ScrollArea({
  children,
  className,
  scrollFade = false,
  scrollbarGutter = false,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  scrollFade?: boolean,
  scrollbarGutter?: boolean
}) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("group/scroll-area size-full min-h-0", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          `
            h-full
            overscroll-contain rounded-[inherit]
            transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-1 focus-visible:ring-offset-background
          `,
          scrollFade &&
            `
              mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start)))]
              mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end)))]
              mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end)))]
              mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start)))]
              [--fade-size:1.5rem]
            `,
          scrollbarGutter && "data-has-overflow-x:pb-2.5 data-has-overflow-y:pe-2.5"
        )}
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({ className, orientation = "vertical", ...props }: ScrollAreaPrimitive.Scrollbar.Props) {
  const overflowVisibilityClassName = orientation === "vertical"
    ? "hidden data-[has-overflow-y]:flex"
    : "hidden data-[has-overflow-x]:flex";

  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        `
          m-1 opacity-0 transition-opacity delay-300
          group-focus-within/scroll-area:opacity-100 group-hover/scroll-area:opacity-100
          data-[orientation=horizontal]:h-1.5
          data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-1.5
        `,
        overflowVisibilityClassName,
        className
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className="relative flex-1 rounded-full bg-foreground/20"
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
