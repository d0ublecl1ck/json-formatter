import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "关于",
  description: `${siteConfig.name} 的产品介绍与使用说明。`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">关于</h1>
      <p className="mt-4 text-muted-foreground">
        {siteConfig.name} 是一个专注于速度与体验的 JSON 工具：格式化、压缩、排序、搜索与折叠查看。
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold">设计目标</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>默认本地处理：输入内容不会上传到服务器。</li>
          <li>清晰可读：输出区支持折叠层级与搜索高亮。</li>
          <li>可复制可回填：一键复制格式化结果，或压缩回填到输入框。</li>
          <li>移动端与桌面端均可舒适使用。</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold">隐私说明</h2>
        <p className="text-sm text-muted-foreground">
          需要了解隐私细节请前往{" "}
          <Link className="text-foreground underline underline-offset-4" href="/privacy">
            隐私页面
          </Link>
          。
        </p>
      </section>
    </main>
  );
}
