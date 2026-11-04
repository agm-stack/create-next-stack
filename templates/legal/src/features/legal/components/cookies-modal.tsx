import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogPanel, DialogTitle
} from "@/components/ui/dialog";
import { IconCookie } from "@/components/ui/icons/icon-cookie";
import { Link } from "@/components/ui/link";
import { Switch } from "@/components/ui/switch";
import { buildConsent } from "@/features/legal/consent";

import { useText } from "@/hooks/use-text";

import { routes } from "@/utils/routes";

import type { UserConsent } from "@/features/legal/consent";

type Props = {
  consent: UserConsent | null,
  onAccept: () => void,
  onDecline: () => void,
  onSave: (cookies: UserConsent["cookies"]) => void
};

const initializeConsent = () =>
  buildConsent(
    {
      analytics: true,
      marketing: true,
      essential: true,
      functional: true,
    },
    false
  );

function CookiesModal(props: Props) {
  const { consent: initialConsent, onAccept, onDecline, onSave } = props;
  const [consent, setConsent] = useState<UserConsent>(() => initialConsent || initializeConsent());
  const { cookies } = consent || {};

  const t = useText();

  const handleSave = () => onSave(consent.cookies);

  const setCookieValue = (key: keyof UserConsent["cookies"], value: boolean) => {
    setConsent((prev) => ({
      ...prev,
      cookies: {
        ...prev.cookies,
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(initialConsent || initializeConsent());
  }, [initialConsent]);

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center gap-2">
          <IconCookie className="text-primary" />
          <DialogTitle>{t("legal.cookiesModal.title")}</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <p className="mb-4 text-sm">{t("legal.cookiesModal.description")}</p>
          <CookiesList cookies={cookies} setCookieValue={setCookieValue} />
          <div className="mt-4 text-xs text-muted-foreground">
            {t.rich("legal.cookiesModal.disclaimer", {
              link: (chunks) => (
                <Link className="underline" href={routes.cookie} rel="noopener noreferrer" target="_blank">
                  {chunks}
                </Link>
              ),
            })}
          </div>
        </DialogPanel>
        <DialogFooter className="border-t border-neutral-200 px-4" variant="bare">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button className="sm:min-w-25" variant="flat" onClick={onAccept}>
                {t("legal.cookiesModal.accept")}
              </Button>
              <Button className="sm:min-w-25" variant="flat" onClick={onDecline}>
                {t("legal.cookiesModal.decline")}
              </Button>
            </div>
            <div>
              <Button className="font-bold sm:min-w-25" color="primary" onClick={handleSave}>
                {t("legal.cookiesModal.save")}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type CookiesListProps = {
  cookies: UserConsent["cookies"] | undefined,
  setCookieValue: (key: keyof UserConsent["cookies"], value: boolean) => void
};

function CookiesList(props: CookiesListProps) {
  const { cookies, setCookieValue } = props;
  const t = useText();
  return (
    <ul className="flex flex-col gap-4">
      {keys.map((key) => {
        return (
          <li key={key}>
            <Switch
              checked={cookies?.[key]}
              description={t(`legal.cookiesModal.${key}.description`)}
              disabled={key === "essential"}
              size="sm"
              title={t(`legal.cookiesModal.${key}.title`)}
              onCheckedChange={(value) => setCookieValue(key, value)}
            />
          </li>
        );
      })}
    </ul>
  );
}

const keys = ["analytics", "marketing", "functional", "essential"] as const;

export { CookiesModal };
