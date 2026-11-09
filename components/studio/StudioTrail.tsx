import Image from "next/image";
import type { ReactNode } from "react";
import { WalkingCat } from "./WalkingCat";

/**
 * Studio page shell with the cat's trail: a reserved lane beside the content,
 * so the walking cat never covers text, links or forms. Full-bleed open ground
 * marked `data-wander` (target x fraction, with an optional
 * `data-wander-ground` footpath line) is where the cat may cross. On phones
 * there is no lane and the cat only walks in from the edge to cross those bands.
 */
export function StudioTrail({ children }: { children: ReactNode }) {
  return (
    <div className="trail trail--cat">
      <div className="trail__content">{children}</div>
      <div className="trail__lane" data-cat-lane aria-hidden="true">
        <span className="trail__path" />
        <Image className="trail__static-cat" src="/beopity/cat-sitting.webp" alt="" width={540} height={640} />
      </div>
      <WalkingCat />
    </div>
  );
}
