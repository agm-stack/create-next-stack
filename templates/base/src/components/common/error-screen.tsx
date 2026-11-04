import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { routes } from "@/utils/routes";

type ErrorScreenProps = {
  code?: string,
  description: string,
  homeLabel: string,
  onRetry?: () => void,
  retryLabel?: string,
  title: string
};

const CENTER_MASK = "radial-gradient(ellipse at center, black, transparent 65%)";

/**
 * Shared full-page message for error and not-found states. Free of
 * provider-dependent hooks so it also works in global-error, which renders
 * outside the app providers.
 */
export function ErrorScreen({
  code,
  description,
  homeLabel,
  onRetry,
  retryLabel,
  title,
}: ErrorScreenProps) {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--brand-subtle)_0%,transparent_65%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, var(--brand) 1px, transparent 1.4px)",
            backgroundSize: "24px 24px",
            maskImage: CENTER_MASK,
            opacity: 0.22,
            WebkitMaskImage: CENTER_MASK,
          }}
        />
      </div>
      <Logo className="mb-12" size="md" />
      <div className="max-w-md">
        {code && (
          <p
            aria-hidden="true"
            className="mb-3 text-5xl font-bold tracking-[0.12em] text-brand sm:text-6xl"
          >
            <span className="inline-block origin-bottom-right -translate-x-1 -rotate-12">
              {code.slice(0, 1)}
            </span>
            {code.slice(1, -1)}
            <span className="inline-block origin-bottom-left translate-x-1 rotate-12">
              {code.slice(-1)}
            </span>
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {onRetry && retryLabel && (
          <Button color="brand" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        <Button
          color="brand"
          href={routes.home}
          variant={onRetry ? "outline" : "filled"}
        >
          {homeLabel}
        </Button>
      </div>
    </main>
  );
}
