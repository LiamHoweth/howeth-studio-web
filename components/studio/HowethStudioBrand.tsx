import Link from "next/link";

export function HowethStudioBrand() {
  return (
    <Link href="/" className="studio-brand" aria-label="Howeth Studio — home">
      <span className="studio-brand-h" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="36" height="36" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="currentColor" />
          <path className="studio-brand-h__letter" d="M8 8h4v6h8V8h4v16h-4v-6h-8v6H8V8z" />
        </svg>
      </span>
      <span className="studio-brand-lockup">
        <span className="studio-brand-wordmark">
          <strong>Howeth</strong>
          <span className="studio-brand-wordmark-light">Studio</span>
        </span>
        <span className="studio-brand-tagline">Independent by design</span>
      </span>
    </Link>
  );
}
