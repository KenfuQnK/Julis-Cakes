/**
 * Web counterpart of `binaryUpload.native.ts`: the picker hands us a blob URL,
 * so the browser can read and PUT it without any native file system module.
 */
export async function putBinary(
  localUri: string,
  uploadUrl: string,
  headers: Record<string, string>,
): Promise<void> {
  const blob = await (await fetch(localUri)).blob();
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers,
  });

  if (!response.ok) throw new Error(`Image upload failed (${response.status})`);
}
