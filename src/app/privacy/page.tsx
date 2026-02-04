import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "隐私",
  description: `${siteConfig.name} 的隐私政策说明。`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">隐私政策</h1>
      <p className="mt-4 text-sm text-muted-foreground">更新日期：2026-02-03</p>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold">数据处理</h2>
        <p className="text-sm text-muted-foreground">
          {siteConfig.name} 的核心功能在浏览器本地运行。默认情况下，你粘贴/输入的 JSON 内容不会被上传到服务器。
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold">日志与追踪</h2>
        <p className="text-sm text-muted-foreground">
          我们不在产品中主动记录你的 JSON 内容。若未来引入分析或错误追踪服务，将在此页面提前说明并提供可控选项。
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold">第三方链接</h2>
        <p className="text-sm text-muted-foreground">
          页面可能包含指向第三方网站的链接（例如 GitHub）。第三方网站的隐私实践不受本页面约束。
        </p>
      </section>
    </main>
  );
}

