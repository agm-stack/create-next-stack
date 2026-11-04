"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card, CardDescription, CardHeader, CardPanel, CardTitle
} from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteAccountDialog } from "@/features/account/components/delete-account-dialog";
import { useSignOut } from "@/features/auth/api/mutations";
import { useUser } from "@/features/auth/api/queries";
import { useText } from "@/hooks/use-text";
import { routes } from "@/utils/routes";

/** Starting point for the signed-in area. Replace the card with your first feature. */
export function DashboardPage() {
  const t = useText("auth.dashboard");
  const { isLoading, user } = useUser();
  const signOut = useSignOut();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const email = user?.email ?? "";

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-5">
          <Logo href={routes.dashboard} size="sm" />
          <Button
            color="secondary"
            loading={signOut.isPending}
            variant="flat"
            onClick={() => signOut.mutate()}
          >
            {t("signOut")}
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-5 py-12">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-wrap items-center justify-between gap-4">
            {isLoading ? (
              <Skeleton className="h-5 w-56" />
            ) : (
              <p className="text-sm text-muted-foreground">{t("signedInAs", { email })}</p>
            )}
            <Button
              color="destructive"
              disabled={!email}
              startContent={<Trash2 aria-hidden="true" className="size-4" />}
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
            >
              {t("deleteAccount")}
            </Button>
          </CardPanel>
        </Card>
      </main>
      <DeleteAccountDialog email={email} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </div>
  );
}
