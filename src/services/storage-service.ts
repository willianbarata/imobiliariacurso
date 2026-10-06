import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const allowedMimes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

function config() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const port = process.env.MINIO_PORT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;
  if (!endpoint || !port || !accessKeyId || !secretAccessKey || !bucket) throw new Error("MINIO_NOT_CONFIGURED");
  return { endpoint: `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${endpoint}:${port}`, accessKeyId, secretAccessKey, bucket };
}

function client() { const value = config(); return new S3Client({ region: "us-east-1", endpoint: value.endpoint, forcePathStyle: true, credentials: { accessKeyId: value.accessKeyId, secretAccessKey: value.secretAccessKey } }); }
function detectedMime(buffer: Buffer) { if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg"; if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png"; if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp"; return null; }

export function validateImage(buffer: Buffer, declaredType: string) { const maxSize = Number(process.env.MAX_IMAGE_SIZE_MB ?? 10) * 1024 * 1024; const mimeType = detectedMime(buffer); if (!mimeType || !allowedMimes.has(mimeType) || mimeType !== declaredType) throw new Error("INVALID_IMAGE_TYPE"); if (!buffer.length || buffer.length > maxSize) throw new Error("IMAGE_TOO_LARGE"); return { mimeType, extension: allowedMimes.get(mimeType)! }; }
export async function uploadImage(propertyId: string, buffer: Buffer, mimeType: string) { const value = config(); const objectKey = `properties/${propertyId}/${randomUUID()}.${allowedMimes.get(mimeType)}`; await client().send(new PutObjectCommand({ Bucket: value.bucket, Key: objectKey, Body: buffer, ContentType: mimeType })); return { bucket: value.bucket, objectKey }; }
export async function deleteImageObject(bucket: string, objectKey: string) { await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey })); }
export async function imageUrl(bucket: string, objectKey: string) { return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket, Key: objectKey }), { expiresIn: 60 }); }
