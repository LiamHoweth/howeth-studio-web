"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { careNoteConfig } from "@/lib/siteConfig";

const navPages = [
  { href: "/carenote-cna/", label: "Overview" },
  { href: "/carenote-cna/features/", label: "Features" },
  { href: "/carenote-cna/how-it-works/", label: "How it works" },
  { href: "/carenote-cna/support/", label: "Support" },
] as const;

function isActive(pathname: string, href: string) {
  const current = pathname.replace(/\/$/, "");
  const target = href.replace(/\/$/, "");
  return current === target || (target !== "/carenote-cna" && current.startsWith(`${target}/`));
}

export function CareNoteSiteHeader() {
  const pathname = usePathname() || "";

  return (
    <div className="cn-product-nav">
      <div className="cn-product-nav__inner">
        <Link className="cn-product-nav__brand" href="/carenote-cna/" aria-label="CareNote CNA overview">
          <Image src="/carenote-cna/assets/brand.png" alt="" width={28} height={28} />
          <span>CareNote CNA</span>
        </Link>
        <nav className="cn-product-nav__links" aria-label="CareNote CNA">
          {navPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              aria-current={isActive(pathname, page.href) ? "page" : undefined}
            >
              {page.label}
            </Link>
          ))}
        </nav>
        <a className="cn-product-nav__download" href={careNoteConfig.appStoreUrl || "/carenote-cna/download/"}>
          Download <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
