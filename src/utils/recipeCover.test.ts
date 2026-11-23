import {
  DEFAULT_RECIPE_COVER,
  getRecipeCoverLayout,
  positionRecipeCover,
} from "@/src/utils/recipeCover";

const frame = { width: 390, height: 120 };

describe("encuadre de portadas", () => {
  it("mantiene nítida la foto junto al lado opuesto al título y extiende el resto", () => {
    const photo = { width: 600, height: 900 };
    const leftTitle = getRecipeCoverLayout(frame, photo, DEFAULT_RECIPE_COVER);
    const rightTitle = getRecipeCoverLayout(frame, photo, {
      ...DEFAULT_RECIPE_COVER,
      titleSide: "right",
    });

    expect(leftTitle.blurred).toBe(true);
    expect(leftTitle.left + leftTitle.width).toBe(frame.width);
    expect(rightTitle.left).toBe(0);
    expect(leftTitle.width / leftTitle.height).toBeCloseTo(600 / 900);
  });

  it("evita huecos al desactivar el desenfoque incluso al arrastrar al límite", () => {
    const settings = { ...DEFAULT_RECIPE_COVER, zoom: 2, blur: false };
    const photo = { width: 2500, height: 500 };
    const moved = positionRecipeCover(frame, photo, settings, -2000, 2000);
    const layout = getRecipeCoverLayout(frame, photo, moved);

    expect(layout.blurred).toBe(false);
    expect(layout.left).toBeLessThan(0);
    expect(layout.left + layout.width).toBe(frame.width);
    expect(layout.top).toBe(0);
  });

  it("conserva la posición relativa al cambiar el tamaño de la pantalla", () => {
    const photo = { width: 600, height: 900 };
    const settings = { ...DEFAULT_RECIPE_COVER, blur: false };
    const moved = positionRecipeCover(frame, photo, settings, 0, -80);
    expect(getRecipeCoverLayout(frame, photo, moved).top).toBe(-80);
    expect(
      getRecipeCoverLayout({ width: 780, height: 240 }, photo, moved).top,
    ).toBe(-160);
  });
});
