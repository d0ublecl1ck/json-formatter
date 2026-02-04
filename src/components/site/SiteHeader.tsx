import Link from "next/link";
import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link href="/about" className="transition-colors hover:text-foreground">
              关于
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              隐私
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="icon" variant="ghost" aria-label="GitHub">
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
