"use client";
import { Button } from "@/components/ui/button";
import { IconCookie } from "@/components/ui/icons/icon-cookie";
import { IconSettings } from "@/components/ui/icons/icon-settings";
import { Link } from "@/components/ui/link";
import { useText } from "@/hooks/use-text";
import { routes } from "@/utils/routes";
import { cn } from "@/utils/styles";

type Props = {
  onAccept: () => void,
  onDecline: () => void,
  onManagePreferences: () => void
};

function CookiesBanner(props: Props) {
  const { onAccept, onDecline, onManagePreferences } = props;
  const t = useText();
  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 z-200 w-full sm:right-4 sm:bottom-4 sm:max-w-105"
      )}
    >
      <div className="m-3 rounded-md border border-border bg-background shadow-sm dark:bg-card">
        <div className="grid">
          <div className="flex items-center justify-between border-border px-4 pt-3">
            <div className="flex items-center gap-2">
              <IconCookie className="size-[1.2rem] text-primary" />
              <h1 className="font-medium">{t("legal.cookiesBanner.title")}</h1>
            </div>
          </div>
          <div className="px-4 pt-3 pb-2 text-start text-xs font-normal text-muted-foreground md:text-sm">
            {t.rich("legal.cookiesBanner.description", {
              link: (chunks) => (
                <Link className="underline" href={routes.cookie}>
                  {chunks}
                </Link>
              ),
              highlight: (chunks) => <span className="font-semibold">{chunks}</span>,
            })}
          </div>
          <div className="flex items-center justify-between gap-2 border-border px-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                startContent={<IconSettings className="size-4" />}
                variant="flat"
                onClick={onManagePreferences}
              >
                {t("legal.cookiesBanner.managePreferences")}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="flat" onClick={onDecline}>
                {t("legal.cookiesBanner.decline")}
              </Button>
              <Button color="primary" size="sm" onClick={onAccept}>
                {t("legal.cookiesBanner.accept")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CookiesBanner };
