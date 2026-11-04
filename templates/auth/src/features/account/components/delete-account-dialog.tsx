"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastManager } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@/lib/react-query";
import { routes } from "@/utils/routes";

import { accountMutations } from "../api/mutations";
import { isAccountDeleteConfirmed } from "../delete-confirmation";

type DeleteAccountDialogProps = {
  email: string,
  onOpenChange: (open: boolean) => void,
  open: boolean
};

export function DeleteAccountDialog({ email, onOpenChange, open }: DeleteAccountDialogProps) {
  const t = useTranslations("auth.account.deleteDialog");
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(accountMutations.delete());
  const [confirmEmail, setConfirmEmail] = useState("");
  const isConfirmed = isAccountDeleteConfirmed(confirmEmail, email);

  const handleOpenChange = (nextOpen: boolean) => {
    // Keep the dialog up while the request runs, so the result is not missed.
    if (deleteMutation.isPending) {
      return;
    }

    if (!nextOpen) {
      setConfirmEmail("");
      deleteMutation.reset();
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isConfirmed) {
      return;
    }

    deleteMutation.mutate(confirmEmail, {
      onSuccess: () => {
        queryClient.clear();
        toastManager.add({
          description: t("successDescription"),
          title: t("successTitle"),
          type: "success",
        });
        router.push(routes.home);
        router.refresh();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl leading-6 font-semibold tracking-[-0.01em]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <Trash2 aria-hidden="true" className="size-4" />
            </span>
            <span>{t("title")}</span>
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-sm">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2 px-6 pb-6">
            <Label className="text-sm font-medium" htmlFor="delete-account-email">
              {t("label", { email })}
            </Label>
            <Input
              autoComplete="off"
              id="delete-account-email"
              spellCheck={false}
              type="email"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
            />
            {deleteMutation.isError && (
              <p className="text-xs text-destructive" role="alert">
                {t("error")}
              </p>
            )}
          </div>
          <DialogFooter variant="bare">
            <Button
              className="rounded-md"
              color="secondary"
              disabled={deleteMutation.isPending}
              type="button"
              variant="flat"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              className="rounded-md shadow-sm"
              color="destructive"
              disabled={!isConfirmed}
              loading={deleteMutation.isPending}
              type="submit"
            >
              {t("confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
