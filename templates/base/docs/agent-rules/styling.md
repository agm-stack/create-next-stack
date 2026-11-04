# Styling guidance

- Use Tailwind and application-owned shadcn/Base UI components for application
  UI. Generated primitives live in `src/components/ui` and consume semantic CSS
  variables from `src/styles/tokens.css`.
- Use semantic tokens (`bg-background`, `text-muted-foreground`, `bg-brand`)
  instead of raw colors, so light and dark themes keep working.
- Prefer colocated Tailwind classes for ordinary component styling. Use CSS
  files and global selectors only for genuine shared foundations or specialized
  visual behavior.
- Never store Tailwind class strings or arbitrary CSS as user-editable persisted
  data.
- Dialogs use the shared `Dialog*` primitives in `src/components/ui/dialog.tsx`,
  which own the look (rounded-xl popup, `p-6` header without divider, `px-6`
  panel and footer, right-aligned footer buttons). Do not restyle the popup,
  header, title or description per dialog; only set width (`max-w-md`) and
  content layout. Use `DialogFooter variant="bare"` for form dialogs.
- Text areas and other free-text fields must wrap unbroken strings
  (`wrap-anywhere`, `min-w-0`) so long input never widens the container.
- Preview components and tokens in development at `/dev/theme-playground`.
