import { ErrorScreen } from "@/components/common/error-screen";
import { getText } from "@/i18n/get-text";

export default async function NotFound() {
  const t = await getText("common.notFound");

  return (
    <ErrorScreen
      code="404"
      description={t("description")}
      homeLabel={t("home")}
      title={t("title")}
    />
  );
}
