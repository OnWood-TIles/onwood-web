import fs from "fs"; import * as mupdf from "mupdf"; import sharp from "sharp";
const PDF="C:/Users/Reagan Genrich/OneDrive/Documents/OnWood Flooring & Tiles/Suppliers/Veneer Stone/VS-Tech-Guide-Arctic-.pdf";
const OUT="C:/Users/Reagan Genrich/Claude/onwood-web/.refwork/veneer/arctic/"; fs.mkdirSync(OUT,{recursive:true});
const doc=mupdf.Document.openDocument(fs.readFileSync(PDF),"application/pdf");
for(const p of [3,5,6,7,9]){
  try{ const pix=doc.loadPage(p-1).toPixmap(mupdf.Matrix.scale(2.2,2.2),mupdf.ColorSpace.DeviceRGB,false,true);
    await sharp(pix.asPNG()).jpeg({quality:88}).toFile(OUT+"page"+p+".jpg"); console.log("page"+p+".jpg"); }
  catch(e){ console.log("page"+p+" ERR",e.message); }
}
