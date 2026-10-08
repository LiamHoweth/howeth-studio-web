import Image from "next/image";
import Link from "next/link";

export function BeopityBrand() {
  return (
    <Link href="/" className="studio-brand" aria-label="Beopity — home">
      <span className="studio-brand-mark" aria-hidden="true">
        <Image src="/beopity/icon.webp" alt="" width={40} height={40} />
      </span>
      <span className="studio-brand-lockup">
        <span className="studio-brand-wordmark"><strong>beopity</strong></span>
        <span className="studio-brand-tagline">Independent by design</span>
      </span>
    </Link>
  );
}
