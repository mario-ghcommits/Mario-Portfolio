Auquara — photo reconstruction

Files
- auquara.glb: colored 3D assembly; glTF coordinates use meters.
- auquara.scad: self-contained editable OpenSCAD model in millimeters. Open in OpenSCAD, adjust scale_factor, preview, then render/export your desired CAD/mesh format.
- auquara-design.json: named component dimensions, shapes, colors, and positions.

Scale
The assumed display board is 190 x 380 mm with 20 mm supports. These dimensions are placeholders chosen to preserve photo proportions, not measured dimensions. Hidden geometry is interpreted. Unfinished tower ceilings and outlined satellite buildings are completed by inference. Uniform white buildings stand on continuous grass ground with paved routes, pocket parks, street trees, and planted roof terraces. Uniformly resize using scale_factor in the CAD file.

References
IMG_1345, IMG_1316, IMG_1315, IMG_1296, supplied by Mario Lin. Original photographs and the home background are not included. The CAD follows the model's circular plan, curved blue towers, open brown towers, white radial buildings, central rounded volumes, satellite modules, and elevated blue board.

Regenerate
Edit src/auquaraModel.js and run pnpm model:export. The website and exports share that geometry source.
