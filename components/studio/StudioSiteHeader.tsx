"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { HowethStudioBrand } from "@/components/studio/HowethStudioBrand";

const navigation = [
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
] as const;

function normalizedPath(path: string) {
  return path === "/" ? path : path.replace(/\/+$/, "");
}

export function StudioSiteHeader() {
  const pathname = normalizedPath(usePathname() || "/");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  return (
    <header
      className="studio-header"
      data-studio-chrome="true"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuToggle.current?.focus();
        }
      }}
    >
      <div className="studio-header-inner">
        <HowethStudioBrand />
        <button
          className="studio-menu-toggle"
          ref={menuToggle}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="studio-primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            {menuOpen ? (
              <path d="m5 5 10 10M15 5 5 15" />
            ) : (
              <path d="M3 6h14M3 14h14" />
            )}
          </svg>
        </button>
        <nav
          id="studio-primary-nav"
          className="studio-nav"
          data-open={menuOpen}
          aria-label="Primary"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === normalizedPath(item.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              {item.label === "Contact" && <span aria-hidden="true">↗</span>}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
