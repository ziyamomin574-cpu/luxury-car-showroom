# Luxe — Premium Car Showroom (v2)

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build
```
(The contact form API is optional: `npm run server:dev`.)

## Where to change things
| What | Where |
|---|---|
| Address, phone, email, hours, logo, Google Maps embed, showroom photo | `src/data/showroom.ts` |
| Cars, specs, features | `src/data/cars.ts` |
| Home videos (play in the order of `cars`) | `public/videos/<slug>.mp4` |
| Car photo (ONE per car) | `public/images/<slug>.jpg` |
| Paint mask for that photo | `public/masks/<slug>.png` |

## Automatic colours
White / Red / Black / Blue / Grey are generated in the browser from the single car photo
(`src/lib/recolor.ts`). Only pixels inside the car's paint mask change, so wheels, glass, lights,
reflections, shadows and background stay as photographed. Target HSV hue and saturation are applied
even to achromatic source paint; source luminance controls paint value and a restrained highlight blend
keeps bright reflections colored instead of leaving white patches. Mask feathering is clipped to the
paint selection, so it cannot expand into the intake, winglet trim or adjacent non-paint details.

Each photo needs a grayscale paint mask (white = body paint). Masks for the six current cars are included.
For a new photo, `tools/paint-masks/1_isolate_car.py` and `2_paint_mask.py` can create a starting point,
but their GrabCut and pixel-threshold heuristics are not semantic segmentation: inspect and correct the
result before using it. The final mask must be independent of source paint colour: include doors, hood,
roof panels, bumpers and fenders; paint black over glass, tyres, lights, grille, chrome and background.
Hue/saturation thresholds cannot reliably separate body paint across white, black, silver and saturated
paint colours.

The recolour API accepts `colorIntensity` (0-1), `maskThreshold` (0-254), and `maskFeatherPx` (0-5):

```ts
buildVariants(car.slug, car.images.main, car.images.mask, colorIds, {
  colorIntensity: 1,
  maskThreshold: 8,
  maskFeatherPx: 3,
  debugMask: true,
})
```

`debugMask: true` downloads the processed grayscale mask as `<car-slug>-paint-mask.png`.

## Home video note
The six supplied videos are portrait and ~6 s long. They are cropped to fill the screen
(`video.focus` in `cars.ts` sets the crop). Landscape 16:9 clips will look sharper on desktop.

## Legacy 3D showroom
The old 3D code is preserved in `legacy-3d/` (not used by the site). See `legacy-3d/README.md`.
