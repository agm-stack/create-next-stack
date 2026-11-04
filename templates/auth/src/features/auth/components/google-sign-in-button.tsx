"use client";

import { Button } from "@/components/ui/button";
import { IconGoogle } from "@/components/ui/icons/icon-google";
import { cn } from "@/utils/styles";

type GoogleSignInButtonProps = {
  className?: string,
  disabled?: boolean,
  label: string,
  loading?: boolean,
  onClick: () => void
};

/**
 * The recommended sign-in: Google returns to the same tab, so the session
 * starts where the user began. Styled as the primary
 * action so it reads as the default over email.
 */
export function GoogleSignInButton({
  className, disabled, label, loading, onClick,
}: GoogleSignInButtonProps) {
  return (
    <Button
      fullWidth
      className={cn("rounded-md shadow-sm", className)}
      color="primary"
      disabled={disabled}
      loading={loading}
      size="lg"
      startContent={(
        <span className="flex size-5 items-center justify-center rounded-full bg-white">
          <IconGoogle aria-hidden="true" className="size-3.5" />
        </span>
      )}
      type="button"
      variant="filled"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function SignInDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
