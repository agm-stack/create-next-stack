"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OTPField } from "@/components/ui/otp-field";
import { useVerifyEmailCode } from "@/features/auth/api/mutations";
import { useRequestErrorToast } from "@/hooks/use-request-error-toast";
import { useText } from "@/hooks/use-text";

// Matches the Supabase "Email OTP length" setting (6 is the default). The
// boxes need a fixed length, so keep the two in sync.
export const EMAIL_CODE_LENGTH = 6;

const CODE_INPUT_ID = "email-sign-in-code";

type EmailCodeFormProps = {
  email: string,
  redirectTo: string,
  size?: "default" | "lg"
};

/**
 * Signs in with the code from the sign-in email. Unlike the link, the code
 * works when the email is opened in another browser or device, so the session
 * starts in the browser where the user asked to sign in.
 */
export function EmailCodeForm({ email, redirectTo, size = "default" }: EmailCodeFormProps) {
  const t = useText();
  const [code, setCode] = useState("");
  const verifyCode = useVerifyEmailCode();
  const showRequestErrorToast = useRequestErrorToast();
  // Stays busy after success while the browser navigates to the redirect.
  const isVerifying = verifyCode.isPending || verifyCode.isSuccess;

  const verify = (token: string) => {
    if (isVerifying) {
      return;
    }

    verifyCode.mutate(
      { email, redirectTo, token },
      {
        onError: (error) => {
          // Clear the boxes so the next attempt starts from the first digit.
          setCode("");
          showRequestErrorToast(error, { title: t("auth.emailCode.errorTitle") });
        },
      },
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    verify(code);
  };

  return (
    <form className="grid gap-3 text-left" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor={CODE_INPUT_ID}>{t("auth.emailCode.label")}</Label>
        <p className="text-sm text-muted-foreground">{t("auth.emailCode.description")}</p>
        <OTPField
          className="mt-1"
          disabled={isVerifying}
          getSlotLabel={(position, length) => t("auth.emailCode.slotLabel", { length: String(length), position: String(position) })}
          id={CODE_INPUT_ID}
          length={EMAIL_CODE_LENGTH}
          value={code}
          onValueChange={setCode}
          // Typing the last digit or pasting the whole code signs in right away.
          onValueComplete={verify}
        />
      </div>
      <Button
        fullWidth
        className="rounded-md"
        color="primary"
        disabled={code.length < EMAIL_CODE_LENGTH || isVerifying}
        loading={isVerifying}
        size={size === "lg" ? "lg" : "md"}
        type="submit"
      >
        {t("auth.emailCode.submit")}
      </Button>
    </form>
  );
}
