"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  MoreHorizontal,
  SettingsIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { useEffect, useState } from "react";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useText } from "@/hooks/use-text";
import { cn } from "@/utils/styles";

const swatches = [
  {
    label: "swatches.background",
    name: "background",
    swatchClassName: "bg-background",
    textClassName: "text-foreground",
  },
  {
    label: "swatches.foreground",
    name: "foreground",
    swatchClassName: "bg-foreground",
    textClassName: "text-background",
  },
  {
    label: "swatches.card",
    name: "card",
    swatchClassName: "bg-card",
    textClassName: "text-card-foreground",
  },
  {
    label: "swatches.primary",
    name: "primary",
    swatchClassName: "bg-primary",
    textClassName: "text-primary-foreground",
  },
  {
    label: "swatches.brand",
    name: "brand",
    swatchClassName: "bg-brand",
    textClassName: "text-brand-foreground",
  },
  {
    label: "swatches.secondary",
    name: "secondary",
    swatchClassName: "bg-secondary",
    textClassName: "text-secondary-foreground",
  },
  {
    label: "swatches.accent",
    name: "accent",
    swatchClassName: "bg-accent",
    textClassName: "text-accent-foreground",
  },
  {
    label: "swatches.muted",
    name: "muted",
    swatchClassName: "bg-muted",
    textClassName: "text-muted-foreground",
  },
  {
    label: "swatches.destructive",
    name: "destructive",
    swatchClassName: "bg-destructive",
    textClassName: "text-destructive-foreground",
  },
  {
    label: "swatches.success",
    name: "success",
    swatchClassName: "bg-success",
    textClassName: "text-success-foreground",
  },
  {
    label: "swatches.warning",
    name: "warning",
    swatchClassName: "bg-warning",
    textClassName: "text-warning-foreground",
  },
] as const;

const buttonColors = [
  { color: "primary", label: "button.primary" },
  { color: "brand", label: "button.brand" },
  { color: "secondary", label: "button.secondary" },
  { color: "accent", label: "button.accent" },
  { color: "success", label: "button.success" },
  { color: "warning", label: "button.warning" },
  { color: "destructive", label: "button.destructive" },
] as const;

const buttonVariants = [
  { label: "button.filled", variant: "filled" },
  { label: "button.outline", variant: "outline" },
  { label: "button.ghost", variant: "ghost" },
  { label: "button.flat", variant: "flat" },
] as const;

const buttonSizes = [
  { label: "button.small", size: "sm" },
  { label: "button.medium", size: "md" },
  { label: "button.large", size: "lg" },
] as const;

type PlaygroundFormValues = {
  sharing: boolean,
  terms: boolean,
  title: string
};

const toastExamples = [
  {
    description: "toast.successDescription",
    label: "toast.successButton",
    title: "toast.successTitle",
    type: "success",
  },
  {
    description: "toast.infoDescription",
    label: "toast.infoButton",
    title: "toast.infoTitle",
    type: "info",
  },
  {
    description: "toast.loadingDescription",
    label: "toast.loadingButton",
    title: "toast.loadingTitle",
    type: "loading",
  },
  {
    description: "toast.warningDescription",
    label: "toast.warningButton",
    title: "toast.warningTitle",
    type: "warning",
  },
  {
    description: "toast.errorDescription",
    label: "toast.errorButton",
    title: "toast.errorTitle",
    type: "error",
  },
] as const;

const badgeExamples = [
  { label: "badge.default", variant: "default" },
  { label: "badge.brand", variant: "brand" },
  { label: "badge.secondary", variant: "secondary" },
  { label: "badge.accent", variant: "accent" },
  { label: "badge.success", variant: "success" },
  { label: "badge.warning", variant: "warning" },
  { label: "badge.destructive", variant: "destructive" },
  { label: "badge.outline", variant: "outline" },
] as const;

const playgroundNavigation = [
  { href: "#playground-colors", label: "navigation.colors" },
  { href: "#playground-button", label: "navigation.button" },
  { href: "#playground-form", label: "navigation.form" },
  { href: "#playground-alert", label: "navigation.alert" },
  { href: "#playground-badge", label: "navigation.badge" },
  { href: "#playground-skeleton", label: "navigation.skeleton" },
  { href: "#playground-tooltip", label: "navigation.tooltip" },
  { href: "#playground-tabs", label: "navigation.tabs" },
  { href: "#playground-components", label: "navigation.components" },
  { href: "#playground-toast", label: "navigation.toast" },
] as const;

export function ThemePlayground() {
  const t = useText("themePlayground");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDark]);

  return (
    <section
      aria-labelledby="theme-playground-title"
      className="mt-12 rounded-md border border-border bg-card p-4 text-card-foreground sm:p-6 lg:p-8"
    >
      <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-md border border-border bg-background/50 p-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {t("navigation.eyebrow")}
            </p>
            <p className="mt-2 font-semibold tracking-tight">
              {t("navigation.title")}
            </p>
            <nav
              aria-label={t("navigation.label")}
              className="mt-4 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {playgroundNavigation.map(({ href, label }) => (
                <a
                  key={href}
                  className="
                    rounded-sm px-2.5 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors
                    hover:bg-accent hover:text-accent-foreground
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
                  "
                  href={href}
                >
                  {t(label)}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("eyebrow")}
              </p>
              <h2
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="theme-playground-title"
              >
                {t("title")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("description")}</p>
            </div>

            <Button
              aria-pressed={isDark}
              size="sm"
              onClick={() => setIsDark((current) => !current)}
            >
              {isDark ? t("switchToLight") : t("switchToDark")}
            </Button>
          </div>

          <section
            aria-labelledby="colors-playground-title"
            className="mt-8 scroll-mt-6"
            id="playground-colors"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("colors.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="colors-playground-title"
              >
                {t("colors.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("colors.description")}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {swatches.map(
                ({ label, name, swatchClassName, textClassName }) => (
                  <div
                    key={name}
                    className={cn(
                      "min-h-24 rounded-sm border border-border p-3",
                      swatchClassName,
                      textClassName,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-medium">{t(label)}</span>
                      <code className="rounded-sm bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">
                        {`--${name}`}
                      </code>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <section
            aria-labelledby="button-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-button"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("button.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="button-playground-title"
              >
                {t("button.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("button.description")}
              </p>
            </div>

            <div className="mt-8 grid gap-8">
              <div>
                <h4 className="text-sm font-semibold">{t("button.colors")}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {buttonColors.map(({ color, label }) => (
                    <Button key={color} color={color}>
                      {t(label)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold">{t("button.variants")}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {buttonVariants.map(({ label, variant }) => (
                    <Button key={variant} variant={variant}>
                      {t(label)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold">{t("button.sizes")}</h4>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {buttonSizes.map(({ label, size }) => (
                    <Button key={size} size={size}>
                      {t(label)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold">{t("button.content")}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button startContent={<ArrowLeft aria-hidden="true" />}>
                    {t("button.back")}
                  </Button>
                  <Button endContent={<ArrowRight aria-hidden="true" />}>
                    {t("button.continue")}
                  </Button>
                  <Button
                    iconOnly
                    aria-label={t("button.more")}
                    variant="outline"
                  >
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold">{t("button.states")}</h4>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button loading>{t("button.loading")}</Button>
                  <Button disabled>{t("button.disabled")}</Button>
                  <Button color="brand" href="/" variant="outline">
                    {t("button.link")}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="form-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-form"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("form.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="form-playground-title"
              >
                {t("form.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("form.description")}
              </p>
            </div>

            <div className="mt-8 grid gap-8">
              <div>
                <h4 className="text-sm font-semibold">{t("form.input")}</h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="playground-project-name">
                      {t("form.input")}
                    </Label>
                    <Input
                      id="playground-project-name"
                      placeholder={t("form.inputPlaceholder")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="playground-small-input">
                      {t("form.smallInput")}
                    </Label>
                    <Input
                      id="playground-small-input"
                      placeholder={t("form.smallInput")}
                      size="sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="playground-large-input">
                      {t("form.largeInput")}
                    </Label>
                    <Input
                      id="playground-large-input"
                      placeholder={t("form.largeInput")}
                      size="lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="playground-disabled-input">
                      {t("form.disabledInput")}
                    </Label>
                    <Input
                      disabled
                      id="playground-disabled-input"
                      placeholder={t("form.disabledInput")}
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="playground-invalid-input">
                      {t("form.invalidInput")}
                    </Label>
                    <Input
                      aria-invalid="true"
                      defaultValue="Needs attention"
                      id="playground-invalid-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="playground-description">
                    {t("form.descriptionLabel")}
                  </Label>
                  <Textarea
                    id="playground-description"
                    placeholder={t("form.descriptionPlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="playground-timezone">
                    {t("form.timezone")}
                  </Label>
                  <Select defaultValue="local">
                    <SelectTrigger id="playground-timezone">
                      <SelectValue placeholder={t("form.timezonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">{t("form.localTime")}</SelectItem>
                      <SelectItem value="utc">{t("form.utc")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Checkbox
                  defaultChecked
                  description={t("form.notificationsDescription")}
                  label={t("form.notifications")}
                />
                <Switch
                  defaultChecked
                  color="success"
                  description={t("form.publicDescription")}
                  label={t("form.public")}
                />
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-semibold">
                  {t("form.fieldWrappers")}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("form.fieldWrappersDescription")}
                </p>
                <Form<PlaygroundFormValues>
                  shouldSubmitOnBlur
                  classNames={{ root: "mt-4 max-w-xl" }}
                  fields={[
                    {
                      type: "input",
                      props: {
                        label: t("form.wrapperInput"),
                        name: "title",
                        placeholder: t("form.wrapperInputPlaceholder"),
                      },
                    },
                    {
                      type: "checkbox",
                      props: {
                        label: t("form.wrapperCheckbox"),
                        name: "terms",
                      },
                    },
                    {
                      type: "switch",
                      props: {
                        color: "brand",
                        label: t("form.wrapperSwitch"),
                        name: "sharing",
                      },
                    },
                  ]}
                  initialValues={{ sharing: false, terms: false, title: "" }}
                  submitLabel={t("form.validate")}
                  validationSchema={z.object({
                    sharing: z.boolean(),
                    terms: z.boolean(),
                    title: z.string().min(1, t("form.inputError")),
                  })}
                />
              </div>
            </div>
          </section>

          <section
            aria-labelledby="alert-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-alert"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("alert.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="alert-playground-title"
              >
                {t("alert.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("alert.description")}
              </p>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              <Alert>
                <InfoIcon aria-hidden="true" />
                <AlertTitle>{t("alert.defaultTitle")}</AlertTitle>
                <AlertDescription>
                  {t("alert.defaultDescription")}
                </AlertDescription>
              </Alert>

              <Alert variant="info">
                <InfoIcon aria-hidden="true" />
                <AlertTitle>{t("alert.infoTitle")}</AlertTitle>
                <AlertDescription>{t("alert.infoDescription")}</AlertDescription>
              </Alert>

              <Alert variant="success">
                <CircleCheckIcon aria-hidden="true" />
                <AlertTitle>{t("alert.successTitle")}</AlertTitle>
                <AlertDescription>
                  {t("alert.successDescription")}
                </AlertDescription>
              </Alert>

              <Alert variant="warning">
                <TriangleAlertIcon aria-hidden="true" />
                <AlertTitle>{t("alert.warningTitle")}</AlertTitle>
                <AlertDescription>
                  {t("alert.warningDescription")}
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <CircleAlertIcon aria-hidden="true" />
                <AlertTitle>{t("alert.destructiveTitle")}</AlertTitle>
                <AlertDescription>
                  {t("alert.destructiveDescription")}
                </AlertDescription>
              </Alert>
            </div>
          </section>

          <section
            aria-labelledby="badge-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-badge"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("badge.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="badge-playground-title"
              >
                {t("badge.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("badge.description")}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {badgeExamples.map(({ label, variant }) => (
                <Badge key={variant} variant={variant}>
                  {t(label)}
                </Badge>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="skeleton-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-skeleton"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("skeleton.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="skeleton-playground-title"
              >
                {t("skeleton.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("skeleton.description")}
              </p>
            </div>

            <div className="mt-8 max-w-xl rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </section>

          <section
            aria-labelledby="tooltip-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-tooltip"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("tooltip.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="tooltip-playground-title"
              >
                {t("tooltip.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("tooltip.description")}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger
                  aria-label={t("tooltip.settingsLabel")}
                  render={<Button iconOnly variant="outline" />}
                >
                  <SettingsIcon aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>
                  {t("tooltip.settingsDescription")}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  aria-label={t("tooltip.moreLabel")}
                  render={<Button iconOnly variant="ghost" />}
                >
                  <MoreHorizontal aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>
                  {t("tooltip.moreDescription")}
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          <section
            aria-labelledby="tabs-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-tabs"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("tabs.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="tabs-playground-title"
              >
                {t("tabs.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("tabs.description")}
              </p>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <Tabs className="min-w-0" defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
                  <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
                  <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  {t("tabs.overviewContent")}
                </TabsContent>
                <TabsContent value="settings">
                  {t("tabs.settingsContent")}
                </TabsContent>
                <TabsContent value="activity">
                  {t("tabs.activityContent")}
                </TabsContent>
              </Tabs>

              <div className="grid gap-2">
                <p className="text-sm font-medium">{t("segmentedControl.label")}</p>
                <SegmentedControl
                  aria-label={t("segmentedControl.label")}
                  defaultValue={["comfortable"]}
                >
                  <SegmentedControlItem value="comfortable">
                    {t("segmentedControl.comfortable")}
                  </SegmentedControlItem>
                  <SegmentedControlItem value="compact">
                    {t("segmentedControl.compact")}
                  </SegmentedControlItem>
                  <SegmentedControlItem value="focused">
                    {t("segmentedControl.focused")}
                  </SegmentedControlItem>
                </SegmentedControl>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="composite-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-components"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("components.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="composite-playground-title"
              >
                {t("components.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("components.description")}
              </p>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("components.card.title")}</CardTitle>
                  <CardDescription>
                    {t("components.card.description")}
                  </CardDescription>
                  <CardAction>
                    <Button color="brand" size="sm" variant="ghost">
                      {t("components.card.action")}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("components.card.body")}
                  </p>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button size="sm">{t("components.card.footer")}</Button>
                </CardFooter>
              </Card>

              <Accordion className="rounded-md border border-border px-4">
                <AccordionItem value="card">
                  <AccordionTrigger>
                    {t("components.accordion.firstTitle")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("components.accordion.firstContent")}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="collapse">
                  <AccordionTrigger>
                    {t("components.accordion.secondTitle")}
                  </AccordionTrigger>
                  <AccordionContent>
                    {t("components.accordion.secondContent")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="lg:col-span-2">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" />}>
                    {t("components.dialog.open")}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("components.dialog.title")}</DialogTitle>
                      <DialogDescription>
                        {t("components.dialog.description")}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogPanel>
                      <p className="text-sm text-muted-foreground">
                        {t("components.dialog.body")}
                      </p>
                    </DialogPanel>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>
                        {t("components.dialog.cancel")}
                      </DialogClose>
                      <DialogClose render={<Button />}>
                        {t("components.dialog.confirm")}
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="toast-playground-title"
            className="mt-12 scroll-mt-6 border-t border-border pt-8"
            id="playground-toast"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t("toast.eyebrow")}
              </p>
              <h3
                className="mt-3 text-2xl font-semibold tracking-tight"
                id="toast-playground-title"
              >
                {t("toast.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("toast.description")}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {toastExamples.map(({ description, label, title, type }) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() =>
                    toastManager.add({
                      description: t(description),
                      timeout: type === "loading" ? 0 : undefined,
                      title: t(title),
                      type,
                    })}
                >
                  {t(label)}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
