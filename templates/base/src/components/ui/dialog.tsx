"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import { IconX } from "@/components/ui/icons/icon-x";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useText } from "@/hooks/use-text";
import { cn } from "@/utils/styles";

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        `
          fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-all duration-200
          data-ending-style:opacity-0
          data-starting-style:opacity-0
        `,
        className
      )}
      data-slot="dialog-backdrop"
      {...props}
    />
  );
}

function DialogViewport({ className, ...props }: DialogPrimitive.Viewport.Props) {
  return (
    <DialogPrimitive.Viewport
      className={cn("fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4", className)}
      data-slot="dialog-viewport"
      {...props}
    />
  );
}

function DialogPopup({
  bottomStickOnMobile = true,
  children,
  className,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean,
  bottomStickOnMobile?: boolean
}) {
  const t = useText("common");

  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogViewport className={cn(bottomStickOnMobile && "max-sm:grid-rows-[1fr_auto] max-sm:pt-12")}>
        <DialogPrimitive.Popup
          className={cn(
            `
              relative row-start-2 flex max-h-full min-h-0 w-full max-w-lg min-w-0 translate-y-[calc(-1.25rem*var(--nested-dialogs))]
              scale-[calc(1-0.1*var(--nested-dialogs))] flex-col
              overflow-hidden rounded-xl border border-border/80 bg-popover text-start text-popover-foreground
              opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-[0_24px_80px_rgba(15,23,42,0.18)]
              transition-[scale,opacity,translate] duration-200
              ease-in-out will-change-transform
              data-ending-style:scale-98 data-ending-style:opacity-0
              data-nested:data-ending-style:translate-y-8
              data-nested-dialog-open:origin-top
              data-starting-style:scale-98 data-starting-style:opacity-0
              data-nested:data-starting-style:translate-y-8
            `,
            bottomStickOnMobile &&
              `
                max-sm:rounded-sm max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:opacity-[calc(1-min(var(--nested-dialogs),1))]
                max-sm:data-ending-style:translate-y-4
                max-sm:data-starting-style:translate-y-4
              `,
            className
          )}
          data-slot="dialog-popup"
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              aria-label={t("close")}
              className="absolute inset-e-2 top-2"
              render={<Button size="icon" variant="ghost" />}
            >
              <IconX />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </DialogViewport>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-6 pb-5 text-start",
        className
      )}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "bare"
}) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-end gap-2 px-6",
        variant === "default" && "border-t bg-muted/50 py-4",
        variant === "bare" && "pt-0 pb-6",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn("font-heading text-xl leading-6 font-semibold tracking-[-0.01em]", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-5 text-muted-foreground", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

function DialogPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollArea>
      <div className={cn("px-6 pb-6", className)} data-slot="dialog-panel" {...props} />
    </ScrollArea>
  );
}

export {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPopup as DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBackdrop as DialogOverlay,
  DialogPanel,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogViewport
};
