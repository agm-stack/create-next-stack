"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmationDialogProps = {
  cancelLabel: string,
  confirmLabel: string,
  description: string,
  icon?: React.ReactNode,
  onConfirm: () => void,
  onOpenChange: (open: boolean) => void,
  open: boolean,
  title: string
};

export function ConfirmationDialog({
  cancelLabel,
  confirmLabel,
  description,
  icon,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="min-w-0">
            <DialogTitle className="flex items-center gap-2 text-xl leading-6 font-semibold tracking-[-0.01em]">
              {icon && (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                  {icon}
                </span>
              )}
              <span>
                {title}
              </span>
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-sm">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter
          variant="bare"
        >
          <Button
            className="rounded-md"
            color="secondary"
            variant="flat"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            className="rounded-md shadow-sm"
            color="destructive"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
