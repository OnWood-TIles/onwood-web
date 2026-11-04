"use client";

import { useState } from "react";

// Product photos at the top of a product-with-options page (e.g. a Marquis vanity),
// so the customer sees the actual product they are building. Thumbnails swap the
// main photo; styles live in builderCss.ts (.vb-gal-*).
export default function OptionsPhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="vb-gal">
      <img src={photos[i]} alt={name} className="vb-gal-main" />
      {photos.length > 1 && (
        <div className="vb-gal-thumbs">
          {photos.map((p, k) => (
            <button type="button" key={p} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Photo ${k + 1} of ${name}`}>
              <img src={p} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
