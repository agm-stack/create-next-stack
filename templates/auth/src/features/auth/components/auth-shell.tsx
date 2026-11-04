import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-muted/30 px-4 py-8 sm:px-6 md:bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden md:block"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,var(--brand-subtle)_0%,transparent_58%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
            opacity: 0.10,
            WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, var(--brand) 1px, transparent 1.4px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
            opacity: 0.08,
            WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
          }}
        />
      </div>
      <div className="relative z-10 flex w-full justify-center">
        {children}
      </div>
    </div>
  );
}
