"use client";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { Captcha, useCaptcha } from "@/components/common/captcha";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form/form";
import { IconEmail } from "@/components/ui/icons/icon-email";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/ui/logo";
import { appConfig } from "@/config";
import { useSignInWithGoogle, useSignInWithMagicLink } from "@/features/auth/api/mutations";
import { useRequestErrorToast } from "@/hooks/use-request-error-toast";
import { useText } from "@/hooks/use-text";
import { routes } from "@/utils/routes";

import { EmailCodeForm } from "./email-code-form";
import { GoogleSignInButton, SignInDivider } from "./google-sign-in-button";

type FormValues = {
  email: string
};

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
};

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const t = useText();
  // The address the link and code were sent to; set once the email is sent.
  const [sentToEmail, setSentToEmail] = useState<string>();
  const [isGoogleSignInRedirecting, setIsGoogleSignInRedirecting] = useState(false);

  const isSignIn = mode === "sign-in";
  const isCaptchaEnabled = appConfig.captcha.enabled;
  const redirectTo = searchParams.get("redirectTo") || routes.dashboard;
  // Set by /api/auth/callback when the link can't sign in: usually opened in
  // another browser (PKCE), already used, or expired.
  const hasLinkFailed = searchParams.get("error") === "auth_callback";
  const namespace = isSignIn ? "auth.signIn" : "auth.signUp";
  const {
    captchaRef, captchaToken, isCaptchaVisible, setCaptchaToken, setCaptchaVisible
  } = useCaptcha();
  const showRequestErrorToast = useRequestErrorToast();
  const { isPending: isSignInWithMagicLinkPending, mutate: signInWithMagicLink } = useSignInWithMagicLink();
  const { isPending: isSignInWithGooglePending, mutate: signInWithGoogle } = useSignInWithGoogle();

  const formSchema = z.object({
    email: z.email({ message: t("auth.validation.invalidEmail") }),
  });

  const handleGoogleSignIn = () => {
    setIsGoogleSignInRedirecting(true);
    signInWithGoogle(
      { redirectTo },
      {
        onError: (error) => {
          showRequestErrorToast(error, { title: t("auth.errors.title") });
          setIsGoogleSignInRedirecting(false);
        },
      }
    );
  };

  const handleSubmit = (data: FormValues) => {
    const { email } = data;
    signInWithMagicLink(
      {
        email,
        captchaToken: isCaptchaEnabled ? captchaToken : undefined,
        redirectTo,
      },
      {
        onError: (error) => {
          showRequestErrorToast(error, { title: t("auth.errors.title") });
        },
        onSuccess: () => {
          setSentToEmail(email);
        },
        onSettled: () => {
          if (captchaRef.current) {
            captchaRef.current.resetCaptcha();
            setCaptchaVisible(false);
            setCaptchaToken("");
          }
        },
      }
    );
  };

  if (sentToEmail) {
    return (
      <div className="w-full max-w-lg bg-card p-0 text-center md:rounded-2xl md:border md:border-border/80 md:p-12 md:shadow-sm">
        <div className="flex flex-col items-center">
          <Logo
            className="mb-6"
            href={routes.home}
            variant="logo"
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("auth.checkEmail.title")}
            </h1>
            <p className="text-base leading-6 text-muted-foreground">
              {t("auth.checkEmail.description")}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <EmailCodeForm email={sentToEmail} redirectTo={redirectTo} size="lg" />
        </div>
        <Button
          fullWidth
          className="mt-3"
          color="primary"
          size="lg"
          variant="ghost"
          onClick={() => setSentToEmail(undefined)}
        >
          {t("auth.checkEmail.back")}
        </Button>
      </div>
    );
  }

  const isAuthLoading = isSignInWithMagicLinkPending || isSignInWithGooglePending || isGoogleSignInRedirecting;

  return (
    <div className="w-full max-w-lg bg-card p-0 md:rounded-2xl md:border md:border-border/80 md:p-12 md:shadow-sm">
      <div className="flex flex-col items-center">
        <Logo
          className="mb-6"
          href={routes.home}
          variant="logo"
        />
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t(`${namespace}.title`)}
          </h1>
          <p className="text-base leading-6 text-muted-foreground">
            {t(`${namespace}.description`)}
          </p>
        </div>
      </div>
      {hasLinkFailed && (
        <Alert className="mt-6" variant="warning">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{t("auth.linkFailed.title")}</AlertTitle>
          <AlertDescription>{t("auth.linkFailed.description")}</AlertDescription>
        </Alert>
      )}
      {/* Google first: it returns to this tab, so it is the most reliable path. */}
      <div className="mt-8 grid gap-6">
        <GoogleSignInButton
          disabled={isAuthLoading}
          label={t(`${namespace}.google`)}
          loading={isSignInWithGooglePending || isGoogleSignInRedirecting}
          onClick={handleGoogleSignIn}
        />
        <SignInDivider label={t("auth.orEmail")} />
      </div>
      <Form
        classNames={{
          actions: "mt-4 gap-3",
          fields: "gap-6 mt-6",
        }}
        fields={[
          {
            type: "input",
            props: {
              "aria-label": t("auth.emailLabel"),
              name: "email",
              autoComplete: "email",
              placeholder: t("auth.emailPlaceholder"),
              size: "lg",
              onFocus: () => {
                if (isCaptchaEnabled) {
                  setCaptchaVisible(true);
                }
              },
            },
          },
        ]}
        initialValues={{
          email: "",
        }}
        renderActionsBefore={() =>
          isCaptchaEnabled && isCaptchaVisible && (
            <div
              className="flex w-full basis-full items-center justify-center pt-1"
            >
              <Captcha
                ref={captchaRef}
                sitekey={appConfig.captcha.siteKey}
                theme="dark"
                onVerify={(token) => {
                  setCaptchaToken(token);
                }}
              />
            </div>
          )}
        submitButtonProps={{
          label: t(`${namespace}.submit`),
          className: "w-full",
          color: "secondary",
          size: "lg",
          variant: "outline",
          startContent: <IconEmail className="size-4" />,
          disabled: isAuthLoading || (isCaptchaEnabled && isCaptchaVisible && !captchaToken),
          loading: isSignInWithMagicLinkPending,
        }}
        validationSchema={formSchema}
        onSubmit={handleSubmit}
      />
      <div className="mt-8 border-t border-border/80 pt-6 text-center">
        {/* @if legal */}
        <p className="mx-auto max-w-sm text-xs leading-5 text-muted-foreground">
          {t.rich("auth.termsDisclaimer", {
            terms: (chunks) => (
              <Link
                className="font-medium text-brand underline-offset-4 hover:underline"
                href={routes.terms}
              >
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link
                className="font-medium text-brand underline-offset-4 hover:underline"
                href={routes.privacy}
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
        {/* @endif */}
        <div className="mt-5 rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {t(`${namespace}.footer`)}
          {" "}
          <Link
            className="font-medium text-brand underline-offset-4 hover:underline"
            href={isSignIn ? routes.signUp : routes.signIn}
          >
            {t(`${namespace}.footerLink`)}
          </Link>
        </div>
      </div>
    </div>
  );
}
