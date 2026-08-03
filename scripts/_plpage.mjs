import fs from "fs";
import * as mupdf from "mupdf";
import sharp from "sharp";
const PDF = "C:/Users/Reagan Genrich/OneDrive/Documents/OnWood Flooring & Tiles/Suppliers/Tile One/Tile One Samples.pdf";
const doc = mupdf.Document.openDocument(fs.readFileSync(PDF), "application/pdf");
const pageNum = Number(process.argv[2]||1) - 1;
const pix = doc.loadPage(pageNum).toPixmap(mupdf.Matrix.scale(2,2), mupdf.ColorSpace.DeviceRGB, false, true);
await sharp(pix.asPNG()).resize(1500,null,{withoutEnlargement:true}).png().toFile("scripts/_plpage.png");
console.log("rendered page", pageNum+1);
