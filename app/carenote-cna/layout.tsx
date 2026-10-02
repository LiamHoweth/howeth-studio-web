import "@/styles/carenote-product-chrome.css";
import { CareNoteSiteFooter } from "@/components/carenote/CareNoteSiteFooter";
import { CareNoteSiteHeader } from "@/components/carenote/CareNoteSiteHeader";
import { StudioSiteHeader } from "@/components/studio/StudioSiteHeader";

export default function CareNoteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="carenote-product">
      <a className="studio-skip" href="#main">Skip to main content</a>
      <StudioSiteHeader />
      <CareNoteSiteHeader />
      {children}
      <CareNoteSiteFooter />
    </div>
  );
}
