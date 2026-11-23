import { useEffect, useState } from "react";
import { Image, Platform } from "react-native";

import type { CoverSize } from "@/src/utils/recipeCover";

const dimensions = new Map<string, CoverSize>();
const loading = new Map<string, Promise<CoverSize>>();
const CACHE_LIMIT = 256;

function loadDimensions(uri: string) {
  const cached = dimensions.get(uri);
  if (cached) return Promise.resolve(cached);
  const pending = loading.get(uri);
  if (pending) return pending;

  const measure =
    Platform.OS === "web"
      ? new Promise<CoverSize>((resolve, reject) => {
          Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            reject,
          );
        })
      : Image.getSize(uri);
  const request = measure
    .then((size) => {
      if (dimensions.size >= CACHE_LIMIT) {
        const oldest = dimensions.keys().next().value;
        if (oldest) dimensions.delete(oldest);
      }
      dimensions.set(uri, size);
      return size;
    })
    .finally(() => loading.delete(uri));
  loading.set(uri, request);
  return request;
}

export function useRecipeCoverImage(uri?: string) {
  const [measured, setMeasured] = useState<{ uri: string; size: CoverSize }>();

  useEffect(() => {
    if (!uri || dimensions.has(uri)) return;
    let active = true;
    void loadDimensions(uri).then(
      (size) => {
        if (active) setMeasured({ uri, size });
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [uri]);

  if (!uri) return undefined;
  return measured?.uri === uri ? measured.size : dimensions.get(uri);
}
