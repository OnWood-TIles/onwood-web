import fs from "fs"; import * as mupdf from "mupdf"; import sharp from "sharp";
const DIR="C:/Users/Reagan Genrich/OneDrive/Documents/OnWood Flooring & Tiles/Suppliers/Veneer Stone/";
const OUT="C:/Users/Reagan Genrich/Claude/onwood-web/.refwork/veneer/"; fs.mkdirSync(OUT,{recursive:true});
function text(pdf){
  const doc=mupdf.Document.openDocument(fs.readFileSync(DIR+pdf),"application/pdf");
  let out="";
  for(let p=0;p<doc.countPages();p++){
    const st=JSON.parse(doc.loadPage(p).toStructuredText("preserve-whitespace").asJSON());
    out+=`\n===== ${pdf} PAGE ${p+1}/${doc.countPages()} =====\n`;
    for(const blk of st.blocks||[]) for(const ln of blk.lines||[]){ const t=(ln.text||"").trim(); if(t) out+=t+"\n"; }
  }
  return out;
}
// dump text of pricelist + all 3 tech guides
let all="";
for(const f of ["Veneer Stone Price List May 2026.pdf","VS-Tech-Guide-Arctic-.pdf","VS-Tech-Guide-Coastal-.pdf","VS-Tech-Guide-Drystack.pdf"]){
  try{ all+=text(f); }catch(e){ all+=`\n[ERR ${f}: ${e.message}]\n`; }
}
fs.writeFileSync(OUT+"text.txt",all);
console.log("text.txt written, "+all.length+" chars");
