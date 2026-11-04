"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/utils/styles";

function Tabs(props: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
  children,
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn(
        `
          relative inline-flex items-center gap-1 border-b border-border
          data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch
          data-[orientation=vertical]:border-r data-[orientation=vertical]:border-b-0
        `,
        className,
      )}
      data-slot="tabs-list"
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        className="
          absolute bottom-0 left-0 h-0.5 bg-brand transition-[transform,width] duration-200
          data-[orientation=vertical]:top-0 data-[orientation=vertical]:right-0 data-[orientation=vertical]:bottom-auto
          data-[orientation=vertical]:left-auto data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-0.5
        "
        data-slot="tabs-indicator"
      />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        `
          inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm
          font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none
          hover:text-foreground
          focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
          data-[orientation=vertical]:justify-start data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:border-b-0 data-disabled:pointer-events-none
          data-disabled:cursor-not-allowed data-disabled:opacity-50 data-active:text-foreground
        `,
        className,
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={cn(
        `
          pt-4 text-sm text-muted-foreground outline-none
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        `,
        className,
      )}
      data-slot="tabs-content"
      {...props}
    />
  );
}

function TabsIndicator({
  className,
  ...props
}: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      className={cn("absolute bg-brand", className)}
      data-slot="tabs-indicator"
      {...props}
    />
  );
}

export {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
};
