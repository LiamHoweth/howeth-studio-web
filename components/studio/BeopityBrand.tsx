import Image from "next/image";
import Link from "next/link";

/** The approved kitten portrait with the exact lowercase wordmark. */
export function BeopityBrand() {
  return (
    <Link href="/" className="studio-brand" aria-label="beopity — home">
      <span className="studio-brand-mark" aria-hidden="true">
        <Image src="/beopity/avatar.webp" alt="" width={88} height={88} priority />
      </span>
      <span className="studio-brand-wordmark" aria-hidden="true" />
    </Link>
  );
}
