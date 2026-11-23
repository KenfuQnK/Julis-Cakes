import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryChip } from "@/src/components/CategoryChip";
import { RecipeCover } from "@/src/components/RecipeCover";
import { Colors } from "@/src/constants/Colors";
import { useRecipeCoverImage } from "@/src/hooks/useRecipeCoverImage";
import { useRecipeCoversStore } from "@/src/stores/recipeCovers.store";
import type { Recipe } from "@/src/types/recipe";
import {
  COVER_SHADE,
  COVER_ZOOM,
  DEFAULT_RECIPE_COVER,
  clampCoverValue,
  getRecipeCoverHeight,
  getRecipeCoverLayout,
  positionRecipeCover,
  type RecipeCoverSettings,
} from "@/src/utils/recipeCover";

interface CoverStepControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function CoverStepControl({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: CoverStepControlProps) {
  const { t } = useTranslation(["recipes"]);
  const percentage = t("recipes:cover.percentage", {
    value: Math.round(value * 100),
  });

  return (
    <View className="flex-row items-center justify-between gap-2">
      <Text className="shrink text-base font-semibold text-foreground">
        {label}
      </Text>
      <View className="flex-row items-center rounded-full bg-surface-alt">
        {([-1, 1] as const).map((direction) => {
          const decrease = direction === -1;
          const unavailable =
            disabled || (decrease ? value <= min : value >= max);
          return (
            <View key={direction} className="flex-row items-center">
              {decrease ? null : (
                <Text className="min-w-[54px] text-center text-sm font-bold tabular-nums text-foreground">
                  {percentage}
                </Text>
              )}
              <Pressable
                onPress={() =>
                  onChange(clampCoverValue(value + step * direction, min, max))
                }
                accessibilityRole="button"
                accessibilityLabel={t(
                  decrease ? "recipes:cover.less" : "recipes:cover.more",
                  { label },
                )}
                disabled={unavailable}
                className={`h-11 w-11 items-center justify-center rounded-full active:bg-primary-soft ${unavailable ? "opacity-35" : ""}`}
              >
                <Feather
                  name={decrease ? "minus" : "plus"}
                  size={19}
                  color={Colors.primaryDark}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface RecipeCoverEditorProps {
  recipe: Recipe;
  featured: boolean;
  initialSettings?: RecipeCoverSettings;
  onClose: () => void;
}

export function RecipeCoverEditor({
  recipe,
  featured,
  initialSettings,
  onClose,
}: RecipeCoverEditorProps) {
  const { t } = useTranslation(["recipes"]);
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const frame = { width, height: getRecipeCoverHeight(width) };
  const imageSize = useRecipeCoverImage(recipe.imageUri);
  const saveCover = useRecipeCoversStore((state) => state.save);
  const [draft, setDraft] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const settings = draft ?? DEFAULT_RECIPE_COVER;

  function move(dx: number, dy: number) {
    if (!imageSize || saving) return;
    setDraft((value) => {
      const previous = value ?? DEFAULT_RECIPE_COVER;
      const layout = getRecipeCoverLayout(frame, imageSize, previous);
      return positionRecipeCover(
        frame,
        imageSize,
        previous,
        layout.left + dx,
        layout.top + dy,
      );
    });
  }

  function zoom(getValue: (previous: number) => number, x: number, y: number) {
    if (!imageSize || saving) return;
    setDraft((value) => {
      const previous = value ?? DEFAULT_RECIPE_COVER;
      const next = {
        ...previous,
        zoom: clampCoverValue(
          getValue(previous.zoom),
          COVER_ZOOM.min,
          COVER_ZOOM.max,
        ),
      };
      if (next.zoom === previous.zoom) return value;
      const layout = getRecipeCoverLayout(frame, imageSize, previous);
      const ratio = next.zoom / previous.zoom;
      return positionRecipeCover(
        frame,
        imageSize,
        next,
        x - (x - layout.left) * ratio,
        y - (y - layout.top) * ratio,
      );
    });
  }

  const pan = Gesture.Pan()
    .enabled(Boolean(imageSize) && !saving)
    .maxPointers(1)
    .minDistance(4)
    .runOnJS(true)
    .onChange(({ changeX, changeY, numberOfPointers }) => {
      if (numberOfPointers === 1) move(changeX, changeY);
    });
  const pinch = Gesture.Pinch()
    .enabled(Boolean(imageSize) && !saving)
    .runOnJS(true)
    .onChange(({ focalX, focalY, scaleChange }) => {
      zoom((previous) => previous * scaleChange, focalX, focalY);
    });

  async function save() {
    setError(false);
    setSaving(true);
    try {
      await saveCover(recipe.id, draft);
      onClose();
    } catch {
      setSaving(false);
      setError(true);
    }
  }

  const title = t("recipes:cover.edit");
  const close = t("recipes:common.cancel");
  const reset = t("recipes:cover.reset");
  const saveLabel = t("recipes:cover.save");

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: top, paddingBottom: bottom }}
    >
      <View className="w-full max-w-[590px] flex-row items-center justify-between gap-2 self-center px-3 py-2">
        <Pressable
          onPress={onClose}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={close}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-primary-soft"
        >
          <Feather name="x" size={24} color={Colors.foreground} />
        </Pressable>
        <Text
          accessibilityRole="header"
          className="shrink text-center text-xl font-extrabold text-foreground"
        >
          {title}
        </Text>
        <Pressable
          onPress={() => void save()}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
          accessibilityState={{ busy: saving }}
          className={`min-h-[44px] justify-center rounded-full bg-primary-fill px-4 active:opacity-80 ${saving ? "opacity-50" : ""}`}
        >
          <Text className="font-bold text-white">{saveLabel}</Text>
        </Pressable>
      </View>

      <GestureDetector
        gesture={Gesture.Simultaneous(pan, pinch)}
        touchAction="none"
        userSelect="none"
      >
        <View
          accessible
          focusable
          accessibilityLabel={t("recipes:cover.preview", {
            title: recipe.title,
          })}
          accessibilityActions={(["left", "right", "up", "down"] as const).map(
            (name) => ({
              name,
              label: t(`recipes:cover.move.${name}`),
            }),
          )}
          onAccessibilityAction={({ nativeEvent }) => {
            const direction = nativeEvent.actionName;
            move(
              direction === "left" ? -16 : direction === "right" ? 16 : 0,
              direction === "up" ? -16 : direction === "down" ? 16 : 0,
            );
          }}
          {...{
            onKeyDown: (event: React.KeyboardEvent) => {
              const { key } = event;
              if (
                !imageSize ||
                saving ||
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  key,
                )
              )
                return;
              event.preventDefault();
              move(
                key === "ArrowLeft" ? -16 : key === "ArrowRight" ? 16 : 0,
                key === "ArrowUp" ? -16 : key === "ArrowDown" ? 16 : 0,
              );
            },
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
          >
            <RecipeCover
              recipe={recipe}
              frame={frame}
              imageSize={imageSize}
              settings={settings}
              featured={featured}
            />
          </View>
        </View>
      </GestureDetector>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-[590px] gap-4 self-center px-4 pb-6 pt-3">
          <Text className="text-sm leading-5 text-muted">
            {t(
              recipe.imageUri
                ? "recipes:cover.gestures"
                : "recipes:cover.noPhoto",
            )}
          </Text>
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">
              {t("recipes:cover.titleSide")}
            </Text>
            <View className="flex-row gap-2">
              {(["left", "right"] as const).map((side) => (
                <CategoryChip
                  key={side}
                  label={t(`recipes:cover.${side}`)}
                  selected={settings.titleSide === side}
                  onPress={() => {
                    if (!saving && settings.titleSide !== side)
                      setDraft({ ...settings, titleSide: side });
                  }}
                />
              ))}
            </View>
          </View>
          <CoverStepControl
            label={t("recipes:cover.zoom")}
            value={settings.zoom}
            {...COVER_ZOOM}
            step={0.15}
            disabled={!imageSize || saving}
            onChange={(value) =>
              zoom(() => value, frame.width / 2, frame.height / 2)
            }
          />
          <CoverStepControl
            label={t("recipes:cover.shade")}
            value={settings.shade}
            {...COVER_SHADE}
            step={0.05}
            disabled={saving}
            onChange={(shade) => setDraft({ ...settings, shade })}
          />
          <View className="flex-row items-center justify-between gap-2">
            <Text className="shrink text-base font-semibold text-foreground">
              {t("recipes:cover.blur")}
            </Text>
            <Switch
              value={settings.blur}
              disabled={!imageSize || saving}
              onValueChange={(blur) => setDraft({ ...settings, blur })}
              accessibilityLabel={t("recipes:cover.blur")}
              trackColor={{ false: Colors.muted, true: Colors.primaryDark }}
              thumbColor={Colors.surface}
            />
          </View>
          {error ? (
            <Text
              accessibilityRole="alert"
              className="font-semibold text-primary-dark"
            >
              {t("recipes:cover.saveError")}
            </Text>
          ) : null}
          <Pressable
            onPress={() => setDraft(undefined)}
            disabled={saving || !draft}
            accessibilityRole="button"
            accessibilityLabel={reset}
            className={`min-h-[44px] flex-row items-center gap-2 self-start rounded-full px-2 active:bg-primary-soft ${draft ? "" : "opacity-50"}`}
          >
            <Feather name="rotate-ccw" size={17} color={Colors.primaryDark} />
            <Text className="font-bold text-primary-dark">{reset}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
