export interface RecipeCoverSettings {
  x: number;
  y: number;
  zoom: number;
  titleSide: "left" | "right";
  shade: number;
  blur: boolean;
}

export interface CoverSize {
  width: number;
  height: number;
}

export const DEFAULT_RECIPE_COVER: RecipeCoverSettings = {
  x: 0,
  y: 0,
  zoom: 1,
  titleSide: "left",
  shade: 0.76,
  blur: true,
};

export const COVER_ZOOM = { min: 1, max: 3 };
export const COVER_SHADE = { min: 0.64, max: 0.94 };

export function clampCoverValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getRecipeCoverHeight(width: number) {
  return Math.round(clampCoverValue(width * 0.28, 120, 210));
}

export function getRecipeCoverLayout(
  frame: CoverSize,
  image: CoverSize,
  settings: RecipeCoverSettings,
) {
  const cover = Math.max(
    frame.width / image.width,
    frame.height / image.height,
  );
  const contain = Math.min(
    frame.width / image.width,
    frame.height / image.height,
  );
  // Keep most of the frame sharp while retaining more of a tightly cropped photo.
  const sharpShare = 0.7;
  const extend = settings.blur && contain / cover < sharpShare;
  const scale = cover * (extend ? sharpShare : 1) * settings.zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  const freeX = (frame.width - width) / 2;
  const freeY = (frame.height - height) / 2;
  const biasX =
    freeX > 0 ? (settings.titleSide === "left" ? freeX : -freeX) : 0;
  const limitX = Math.abs(freeX);
  const limitY = Math.abs(freeY);

  return {
    width,
    height,
    left: freeX + clampCoverValue(biasX + settings.x * limitX, -limitX, limitX),
    top: freeY + settings.y * limitY,
    blurred: extend && (freeX > 0.5 || freeY > 0.5),
  };
}

export function positionRecipeCover(
  frame: CoverSize,
  image: CoverSize,
  settings: RecipeCoverSettings,
  left: number,
  top: number,
): RecipeCoverSettings {
  const centered = getRecipeCoverLayout(frame, image, {
    ...settings,
    x: 0,
    y: 0,
  });
  const rangeX = (frame.width - centered.width) / 2;
  const rangeY = (frame.height - centered.height) / 2;
  const limitX = Math.abs(rangeX);
  const limitY = Math.abs(rangeY);
  return {
    ...settings,
    x:
      limitX > 0.5
        ? (clampCoverValue(left, rangeX - limitX, rangeX + limitX) -
            centered.left) /
          limitX
        : settings.x,
    y:
      limitY > 0.5
        ? clampCoverValue((top - centered.top) / limitY, -1, 1)
        : settings.y,
  };
}
