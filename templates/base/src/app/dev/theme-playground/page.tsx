import { notFound } from "next/navigation";

import { ThemePlayground } from "@/components/design-system/theme-playground";

export default function ThemePlaygroundPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ThemePlayground />
      </div>
    </main>
  );
}
