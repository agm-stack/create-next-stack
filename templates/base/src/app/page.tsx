import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { getText } from "@/i18n/get-text";
import { routes } from "@/utils/routes";

export default async function HomePage() {
  const t = await getText("common");

  return (
    <div className="flex min-h-svh flex-col">
      <main className="container flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
        <Logo size="lg" variant="icon" />
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("home.title")}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("description")}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* @if auth */}
          <Button color="brand" href={routes.signIn}>
            {t("home.getStarted")}
          </Button>
          {/* @endif */}
          {process.env.NODE_ENV === "development" && (
            <Button color="brand" href={routes.devThemePlayground} variant="outline">
              {t("home.designSystem")}
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
