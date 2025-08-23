import { put } from "@vercel/blob";
import { BLOB_READ_WRITE_TOKEN } from "../env";

export async function saveBlob(blob: Blob, path: string) {
  const { url } = await put(path, blob, {
    access: 'public',
    addRandomSuffix: true,
    token: BLOB_READ_WRITE_TOKEN
  });
  return url;
}