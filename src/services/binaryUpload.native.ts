import { File, UploadType } from "expo-file-system";

/**
 * Streams a local file to a presigned URL. Native only — the web build resolves
 * `binaryUpload.web.ts` instead, because expo-file-system is a no-op stub there.
 */
export async function putBinary(
  localUri: string,
  uploadUrl: string,
  headers: Record<string, string>,
): Promise<void> {
  const result = await new File(localUri).upload(uploadUrl, {
    httpMethod: "PUT",
    uploadType: UploadType.BINARY_CONTENT,
    headers,
  });

  // `upload` resolves for any completed response, including 4xx/5xx.
  if (result.status < 200 || result.status >= 300)
    throw new Error(`Image upload failed (${result.status})`);
}
