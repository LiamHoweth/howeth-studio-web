import Image from "next/image";
import Link from "next/link";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export default function NotFound() {
  return (
    <div className="studio-landing">
      <a className="studio-skip" href="#main">
        Skip to main content
      </a>
      <StudioSiteHeader />
      <main id="main" className="studio-not-found">
        <div>
          <p className="studio-mono studio-not-found__index" aria-hidden="true">
            404
          </p>
          <h1 className="studio-not-found__title">This path leads nowhere.</h1>
          <p className="studio-not-found__copy">
            That URL does not match a published page. Check the path, or head back to the
            studio index.
          </p>
          <div className="studio-not-found__actions">
            <Link className="studio-button" href="/">
              Back to index <span aria-hidden="true">↗</span>
            </Link>
            <Link className="studio-cta studio-cta--quiet" href="/work/">
              Work
            </Link>
            <Link className="studio-cta studio-cta--quiet" href="/contact/">
              Contact
            </Link>
          </div>
        </div>
        <Image className="studio-not-found__cat" src="/beopity/cat-sitting.webp" alt="" width={540} height={640} />
      </main>
    </div>
  );
}
