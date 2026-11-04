"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import React from "react";

import { getStoredConsent, storeConsent } from "@/features/legal/consent";
import { setGlobalVariable } from "@/lib/global-variables";
// @if auth
import { routes } from "@/utils/routes";
// @endif

import { CookiesBanner } from "./cookies-banner";
import { CookiesModal } from "./cookies-modal";

import type { UserConsent } from "@/features/legal/consent";

// Not mounted by default: the app starts with strictly necessary cookies and
// storage only (see the Cookie Policy), which need no consent. Mount it in the
// root layout before wiring any analytics or marketing provider, and gate that
// provider on its category.
function ConsentManagerContent() {
  const [consent, setConsent] = React.useState<UserConsent | null>(() => getStoredConsent());
  const [dismissedBannerPath, setDismissedBannerPath] = React.useState<string | null>(null);
  const [isPreferencesModalVisible, setIsPreferencesModalVisible] = React.useState(false);
  const pathname = usePathname();

  const isBannerVisible =
    !consent &&
    shouldShowBannerOnPath(pathname) &&
    dismissedBannerPath !== pathname;

  const openPreferencesModal = () => setIsPreferencesModalVisible(true);
  const closePreferencesModal = () => setIsPreferencesModalVisible(false);

  const closeBanner = () => setDismissedBannerPath(pathname);

  const applyConsent = (value: boolean | UserConsent["cookies"]) => {
    storeConsent(value);
    setConsent(getStoredConsent());
    closeBanner();
  };

  React.useEffect(() => {
    setGlobalVariable("openCookiesPreferencesModal", () => setIsPreferencesModalVisible(true));
  }, []);

  const handleBannerAccept = () => applyConsent(true);
  const handleBannerDecline = () => applyConsent(false);

  const handleBannerManagePreferences = () => {
    closeBanner();
    openPreferencesModal();
  };

  const handlePreferencesModalAccept = () => {
    applyConsent(true);
    closePreferencesModal();
  };

  const handlePreferencesModalDecline = () => {
    applyConsent(false);
    closePreferencesModal();
  };

  const handlePreferencesModalSave = (cookies: UserConsent["cookies"]) => {
    applyConsent(cookies);
    closePreferencesModal();
  };

  return (
    <>
      {isBannerVisible ? (
        <CookiesBanner onAccept={handleBannerAccept} onDecline={handleBannerDecline} onManagePreferences={handleBannerManagePreferences} />
      ) : null}
      {isPreferencesModalVisible ? (
        <CookiesModal
          consent={consent}
          onAccept={handlePreferencesModalAccept}
          onDecline={handlePreferencesModalDecline}
          onSave={handlePreferencesModalSave}
        />
      ) : null}
    </>
  );
}

export const ConsentManager = dynamic(() => Promise.resolve(ConsentManagerContent), { ssr: false });

// @if auth
/** The signed-in area asks for consent through the preferences modal only. */
function shouldShowBannerOnPath(path: string) {
  return !path.startsWith(routes.dashboard);
}
// @else
function shouldShowBannerOnPath(_path: string) {
  return true;
}
// @endif
