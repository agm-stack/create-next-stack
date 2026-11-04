import { getRequestConfig } from "next-intl/server";

import { defaultLocale } from "./config";
import { formats } from "./formats";
import { getMessages } from "./messages";

export default getRequestConfig(() => {
  return {
    locale: defaultLocale,
    messages: getMessages(defaultLocale),
    formats,
  };
});
