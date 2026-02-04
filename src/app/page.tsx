import { JsonFormatterApp } from "@/components/json/JsonFormatterApp";
import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "JSON 格式化",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <JsonFormatterApp />
    </main>
  );
}
