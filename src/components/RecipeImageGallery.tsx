import Feather from "@expo/vector-icons/Feather";
import { useCallback, useMemo, useState } from "react";
import { Modal, PanResponder, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { RecipeImage } from "@/src/components/RecipeImage";
import type { RecipeCategory } from "@/src/types/recipe";

interface RecipeImageGalleryProps {
  imageUris: string[];
  category?: RecipeCategory;
}

export function RecipeImageGallery({
  imageUris,
  category,
}: RecipeImageGalleryProps) {
  const { t } = useTranslation(["recipes"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const imageCount = imageUris.length;
  const currentImage = imageUris[currentIndex];

  const changeImage = useCallback(
    (offset: number) => {
      if (imageCount < 2) return;
      setCurrentIndex((index) => (index + offset + imageCount) % imageCount);
    },
    [imageCount],
  );

  const swipeHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 32 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -48) changeImage(1);
          if (gesture.dx > 48) changeImage(-1);
        },
      }),
    [changeImage],
  );

  return (
    <>
      <View className="h-full w-full">
        {currentImage ? (
          <Pressable
            onPress={() => setIsViewerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:accessibility.openPhoto", {
              number: currentIndex + 1,
            })}
            className="h-full w-full"
          >
            <RecipeImage
              imageUri={currentImage}
              category={category}
              className="h-full w-full"
              placeholderIconSize={46}
            />
          </Pressable>
        ) : (
          <RecipeImage
            category={category}
            className="h-full w-full"
            placeholderIconSize={46}
          />
        )}
        {imageCount > 1 ? (
          <>
            <Pressable
              onPress={() => changeImage(-1)}
              accessibilityRole="button"
              accessibilityLabel={t("recipes:accessibility.previousPhoto")}
              style={{ marginTop: -24 }}
              className="absolute left-3 top-1/2 h-12 w-12 items-center justify-center rounded-full bg-black/45"
            >
              <Feather name="chevron-left" size={28} color="white" />
            </Pressable>
            <Pressable
              onPress={() => changeImage(1)}
              accessibilityRole="button"
              accessibilityLabel={t("recipes:accessibility.nextPhoto")}
              style={{ marginTop: -24 }}
              className="absolute right-3 top-1/2 h-12 w-12 items-center justify-center rounded-full bg-black/45"
            >
              <Feather name="chevron-right" size={28} color="white" />
            </Pressable>
            <View className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5">
              <Text className="text-xs font-semibold text-white">
                {t("recipes:detail.photoCount", {
                  current: currentIndex + 1,
                  count: imageCount,
                })}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      <Modal
        visible={isViewerOpen}
        animationType="fade"
        onRequestClose={() => setIsViewerOpen(false)}
        statusBarTranslucent
      >
        <View
          className="flex-1 items-center justify-center bg-black"
          accessibilityViewIsModal
          {...swipeHandlers.panHandlers}
        >
          <Pressable
            onPress={() => setIsViewerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t("recipes:accessibility.closePhoto")}
            className="absolute right-5 top-12 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/15"
          >
            <Feather name="x" size={26} color="white" />
          </Pressable>
          {currentImage ? (
            <RecipeImage
              imageUri={currentImage}
              category={category}
              resizeMode="contain"
              className="h-[82%] w-full"
              placeholderIconSize={46}
            />
          ) : null}
          {imageCount > 1 ? (
            <>
              <Pressable
                onPress={() => changeImage(-1)}
                accessibilityRole="button"
                accessibilityLabel={t("recipes:accessibility.previousPhoto")}
                className="absolute left-4 top-1/2 h-12 w-12 items-center justify-center rounded-full bg-white/15"
              >
                <Feather name="chevron-left" size={30} color="white" />
              </Pressable>
              <Pressable
                onPress={() => changeImage(1)}
                accessibilityRole="button"
                accessibilityLabel={t("recipes:accessibility.nextPhoto")}
                className="absolute right-4 top-1/2 h-12 w-12 items-center justify-center rounded-full bg-white/15"
              >
                <Feather name="chevron-right" size={30} color="white" />
              </Pressable>
              <Text className="absolute bottom-8 text-sm font-semibold text-white">
                {t("recipes:detail.photoCount", {
                  current: currentIndex + 1,
                  count: imageCount,
                })}
              </Text>
            </>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
