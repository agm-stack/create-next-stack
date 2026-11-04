"use client";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef, useState } from "react";

function Captcha(props: React.ComponentProps<typeof HCaptcha> & { ref?: React.Ref<HCaptcha> }) {
  return <HCaptcha {...props} />;
}

export function useCaptcha() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [isCaptchaVisible, setCaptchaVisible] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);
  return {
    captchaRef,
    isCaptchaVisible,
    setCaptchaVisible,
    captchaToken,
    setCaptchaToken,
  };
}

export { Captcha };
