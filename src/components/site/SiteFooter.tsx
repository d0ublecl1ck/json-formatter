import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="w-full border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. 保留所有权利。
        </p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="transition-colors hover:text-foreground">
            关于
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            隐私
          </Link>
        </div>
      </div>
    </footer>
  );
}
