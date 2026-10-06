import Image from "next/image";

type ImageData = { id: string; isPrimary: boolean; originalFilename: string };
export function AdminImageGallery({ propertyId, images }: { propertyId: string; images: ImageData[] }) {
  if (!images.length) return <p className="form-note">Nenhuma foto cadastrada.</p>;
  return <section className="admin-image-gallery"><h2>Fotos cadastradas</h2><div className="image-previews">{images.map((image) => <div className={"image-preview" + (image.isPrimary ? " is-cover" : "")} key={image.id}><Image src={"/api/admin/properties/" + propertyId + "/images/" + image.id} alt={image.originalFilename || "Foto cadastrada"} fill unoptimized sizes="144px" /><span>{image.isPrimary ? "Foto de capa" : "Foto cadastrada"}</span></div>)}</div></section>;
}
