# Legacy 3D showroom (archived, not used by the live site)

The original React Three Fiber 3D showroom code from the first version of this project.
It is kept here untouched, but it is NOT imported by the new site (the PRD removed the 3D
showroom from the website). Nothing in `legacy-3d/` is bundled or type-checked.

To bring it back: copy `legacy-3d/src/three`, `legacy-3d/src/pages/Showroom.tsx` and
`legacy-3d/src/pages/CarDetail.tsx` into `src/`, and restore the old car data fields
(`model`, `shape`) from `legacy-3d/src/data/cars.ts`. The `three`, `@react-three/*` and `gsap`
dependencies are still listed in package.json for this reason.
