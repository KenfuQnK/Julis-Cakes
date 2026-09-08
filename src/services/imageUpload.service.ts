import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImageManipulatorContext } from "expo-image-manipulator";

// Relative so the platform-suffixed sibling (.native/.web) resolves.
import { putBinary } from "./binaryUpload";
import { requestApi } from "@/src/services/recipes.service";
import { createLogger } from "@/src/utils/logger";

/**
 * Recipe photos live in Neon Object Storage, not on the device: the API signs a
 * short-lived PUT URL and the file goes straight from the phone to the bucket.
 */
const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.8;
const UPLOAD_CONTENT_TYPE = "image/jpeg";

const log = createLogger("ImageUpload");

// expo-image-manipulator's web typings declare the default export as the class
// instead of the registered module instance, and this project's `moduleSuffixes`
// makes TypeScript prefer those typings. The runtime value exposes `manipulate`
// on every platform, so the shape is asserted once here rather than at each call.
const manipulator = ImageManipulator as unknown as {
  manipulate(source: string): ImageManipulatorContext;
};

interface UploadTicket {
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
}

export interface PickedImage {
  uri: string;
  width?: number;
}

/**
 * Camera output is far larger than anything the UI renders, so every picture is
 * re-encoded once to a bounded JPEG before it leaves the device.
 */
async function prepareImage(image: PickedImage): Promise<string> {
  const context = manipulator.manipulate(image.uri);
  if (image.width && image.width > MAX_IMAGE_WIDTH)
    context.resize({ width: MAX_IMAGE_WIDTH });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: JPEG_QUALITY,
  });
  return saved.uri;
}

export async function uploadRecipeImage(image: PickedImage): Promise<string> {
  const localUri = await prepareImage(image);
  const ticket = await requestApi<UploadTicket>("/api/uploads/sign", {
    method: "POST",
    body: JSON.stringify({ contentType: UPLOAD_CONTENT_TYPE }),
  });
  await putBinary(localUri, ticket.uploadUrl, ticket.headers);
  log.info("Recipe image uploaded", { publicUrl: ticket.publicUrl });
  return ticket.publicUrl;
}
