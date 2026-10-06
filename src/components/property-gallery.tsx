"use client";

import Image from "next/image";
import { useState } from "react";

type ImageData = { id: string; originalFilename: string };
export function PropertyGallery({ images }: { images: ImageData[] }) {
  const [current, setCurrent] = useState(0);
  if (!images.length) return <div className="gallery-placeholder">Fotos em breve</div>;
  const image = images[current];
  return <section className="property-gallery" aria-label={"Galeria com " + images.length + " fotos"}><div className="gallery-main"><Image src={"/api/images/" + image.id} alt={image.originalFilename || "Foto " + (current + 1) + " do imóvel"} fill unoptimized sizes="(max-width: 700px) 100vw, 76rem" priority />{images.length > 1 && <><button type="button" className="gallery-prev" onClick={() => setCurrent((index) => (index - 1 + images.length) % images.length)} aria-label="Foto anterior">‹</button><button type="button" className="gallery-next" onClick={() => setCurrent((index) => (index + 1) % images.length)} aria-label="Próxima foto">›</button></>}</div>{images.length > 1 && <div className="gallery-thumbnails">{images.map((item, index) => <button type="button" key={item.id} className={index === current ? "is-active" : ""} onClick={() => setCurrent(index)} aria-label={"Ver foto " + (index + 1)} aria-pressed={index === current}><Image src={"/api/images/" + item.id} alt="" fill unoptimized sizes="96px" /></button>)}</div>}</section>;
}
