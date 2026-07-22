// Legal content for the OnWood Tiles website: Terms of Service (sale of goods)
// and Terms of Website Use. Plain data so the wording is easy to edit, rendered
// by components/marketing/LegalPage.tsx.
//
// ⚠️ Placeholders to confirm before relying on these (see also the values inline):
//   - ABN (below), quote validity, deposit %, return window + restocking fee,
//     damage-reporting window, accepted payment methods.
//   - Have a solicitor review before publishing. These reflect supply-only trade
//     (OnWood does NOT install) and Queensland / Australian Consumer Law.

export const LEGAL_BUSINESS = {
  name: "OnWood Tiles",
  abn: "41 522 687 021",
  email: "sales@onwoodtiles.com.au",
  addressLine1: "2/11 Packer Road",
  addressLine2: "Baringa QLD 4551",
  state: "Queensland",
};

export const LEGAL_UPDATED = "22 July 2026";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "sub"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = { id: string; heading: string; blocks: LegalBlock[] };

export type LegalDoc = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

const B = LEGAL_BUSINESS;

// ── Terms of Service (sale of goods + shop services) ─────────────────────────
export const TERMS_OF_SERVICE: LegalDoc = {
  eyebrow: "Terms of Service",
  title: "Terms of Service",
  intro:
    "These terms apply when you buy tiles, flooring, tapware, accessories or related products from OnWood Tiles. They explain how we quote, take orders, take payment and stand behind what we sell. Please read them before you place an order. Nothing in these terms takes away any rights you have under the Australian Consumer Law.",
  sections: [
    {
      id: "about",
      heading: "About us",
      blocks: [
        { type: "p", text: `${B.name} (ABN ${B.abn}) is a family owned and operated tile and flooring supplier based at ${B.addressLine1}, ${B.addressLine2}. ${B.name} is a registered business name of Reagan Genrich (sole trader). In these terms, "we", "us" and "our" mean ${B.name}, and "you" means the person or business buying from us.` },
        { type: "p", text: "We are a supplier of products. We do not carry out tiling, flooring or installation work. You can reach us any time at " + B.email + " or at the Baringa showroom." },
      ],
    },
    {
      id: "terms",
      heading: "These terms",
      blocks: [
        { type: "p", text: "By placing an order with us, in person, over the phone, by email or online, you agree to these terms. We may update them from time to time; the version current when we accept your order is the one that applies to that order." },
      ],
    },
    {
      id: "quotes",
      heading: "Quotes and pricing",
      blocks: [
        { type: "p", text: "Unless we say otherwise, a written quote is valid for 30 days. Prices are in Australian dollars and, unless stated, include GST." },
        { type: "p", text: "Prices can change, and a quote does not guarantee stock. We confirm the final price when we accept your order. On our website, advertised specials show a price; everyday products show availability rather than a price, and pricing for trade partners is set per their account." },
      ],
    },
    {
      id: "samples",
      heading: "Samples, colour and natural variation",
      blocks: [
        { type: "p", text: "Samples, swatches and display pieces are a guide only. Tiles, natural stone and timber-look products naturally vary in shade, tone, veining, texture, size and finish between production runs, and sometimes within the same run. This variation is a normal characteristic of the product, not a fault." },
        { type: "p", text: "Colours shown on a screen or in print will differ from the real product, so please confirm your choice from a current sample. Because batches vary, we strongly recommend ordering everything you need for a job, plus wastage, in one order so it comes from the same batch or dye lot. Re-orders may not match." },
      ],
    },
    {
      id: "batches",
      heading: "Batches, dye lots and matching",
      blocks: [
        { type: "p", text: "Batch consistency is one of the most important things to get right with tiles and flooring. Tiles, stone and timber-look products are made in production runs, or dye lots, that can vary from one batch to the next in shade, tone, size or calibre, and finish. Product from a single batch is the most consistent." },
        { type: "p", text: "We cannot guarantee that a re-order, top-up or later purchase will come from, or match, an earlier batch. Once a batch is sold out, the manufacturer may not make any more of that exact batch, and a replacement batch can differ noticeably. For this reason we strongly recommend ordering everything you need for a job, plus wastage, in a single order." },
        { type: "p", text: "If you need product to match tiles you already have, or to match across more than one order or area, it is your responsibility to tell an OnWood Tiles staff member at the time of ordering. We will do our best to supply from one batch, or to match your existing tile, but we cannot guarantee a match and may need to see a sample of your existing product. Where you have not told us that a specific batch or a match was required, we are not responsible for variation between batches." },
        { type: "p", text: "When laying your tiles we recommend working from several boxes at once and mixing the pieces across the area, which helps blend the natural variation for the best result." },
      ],
    },
    {
      id: "orders",
      heading: "Orders and acceptance",
      blocks: [
        { type: "p", text: "An order is a request to buy until we confirm it. In-stock orders are confirmed once payment is received; special or indent orders are confirmed when we accept them and receive your deposit." },
        { type: "p", text: "We may decline or cancel an order, for example if a product is unavailable or a price was listed in error. If we do, we will let you know and refund any payment you have made for that order." },
      ],
    },
    {
      id: "special-orders",
      heading: "Special and indent orders",
      blocks: [
        { type: "p", text: "Products we do not normally hold in stock are ordered in specifically for you. Because they are bought to fill your order, special and indent orders cannot be cancelled or changed, and are not refundable for change of mind, once they have been placed with our supplier, except where the Australian Consumer Law requires otherwise." },
        { type: "p", text: "Any lead time we give for a special order is an estimate. We are not responsible for delays outside our control, such as supplier, manufacturing or freight delays." },
      ],
    },
    {
      id: "payment",
      heading: "Deposits and payment",
      blocks: [
        { type: "p", text: "A deposit of 50 percent, or as set out in your quote, is required to place a special or indent order. The balance is payable in full on completion of your order, or before the goods are collected or delivered, whichever comes first." },
        { type: "p", text: "We accept cash, EFTPOS or card, and bank transfer. Credit card payments may incur a surcharge. We do not accept cheque or any form of payment other than those listed. Approved trade partners may purchase on account in line with their agreed account terms. Title to the goods stays with us until they are paid for in full; risk passes to you on delivery or collection (see below)." },
      ],
    },
    {
      id: "quantities",
      heading: "Quantities, coverage and wastage",
      blocks: [
        { type: "p", text: "You are responsible for measuring your space and ordering the right quantity. We are happy to help you estimate, but any coverage figure or calculation we provide is a guide only." },
        { type: "p", text: "Always allow extra for cuts, wastage, breakage and future repairs. As a general guide we recommend at least 10 percent extra, and more for awkward or irregularly shaped areas, unique or feature installation patterns, and large-format tiles. We are not responsible for shortfalls caused by under-ordering, and a top-up order may come from a different batch." },
      ],
    },
    {
      id: "delivery",
      heading: "Collection, delivery and checking your goods",
      blocks: [
        { type: "p", text: "You can collect your order from our Baringa showroom, or we can arrange delivery for a fee quoted at the time. Please check your goods on collection or delivery." },
        { type: "p", text: "Tell us about any visible damage, shortage or incorrect item within 48 hours of collection or delivery so we can put it right. Risk in the goods passes to you once you or your carrier collects them, or once they are delivered to your nominated address." },
      ],
    },
    {
      id: "breakage",
      heading: "Breakage and minor transit damage",
      blocks: [
        { type: "p", text: "Tile is fragile by nature, and a small amount of chipping or breakage during freight, handling and packing is normal for any tile order. Minor chipped or broken pieces can usually still be used, for example for cuts, at the edges of a room, or at the start and end of runs, and allowing for this is one of the reasons we recommend ordering extra for wastage." },
        { type: "p", text: "Because of this, a small amount of damage within an order does not on its own warrant a replacement or refund. Where an order arrives with excessive damage or breakage, we will assess it and decide whether a replacement, credit or other rectification is appropriate. Please report any concern within 48 hours of collection or delivery, and keep the affected product and its packaging so we can inspect it." },
      ],
    },
    {
      id: "installation",
      heading: "We supply, we do not install",
      blocks: [
        { type: "p", text: "OnWood Tiles supplies products only. We do not provide tiling, flooring, waterproofing or installation services." },
        { type: "p", text: "Any guidance we offer on suitability, setting out or installation is general information, not a professional recommendation for your specific project. We recommend you engage a licensed, qualified tiler or installer. We are not responsible for installation, surface preparation, waterproofing, setting out, workmanship or the finished result." },
        { type: "p", text: "Please inspect every product before it is installed. Once a product has been laid or installed, we are not able to help with a claim for a fault that was visible before installation, as laying the product is taken to be acceptance of it." },
      ],
    },
    {
      id: "returns",
      heading: "Returns and change of mind",
      blocks: [
        { type: "p", text: "We generally do not accept returns for change of mind, and you are not entitled to a refund or exchange simply because you have changed your mind." },
        { type: "p", text: "If you ask to return a product for change of mind, whether we accept it is entirely at our discretion. It will depend on whether our supplier will accept the return, and on the current stock levels of the batch being returned. Where we do agree to a change-of-mind return, it must be full, unopened boxes of current stock, in resaleable condition, with proof of purchase. We reserve the right to withhold part of the amount paid to cover freight and handling, administration costs, and any restocking or return penalties charged by our supplier." },
        { type: "p", text: "We cannot accept change-of-mind returns of special or indent orders, clearance or discontinued items, or products that have been opened, cut, used or installed. None of this limits your rights under the Australian Consumer Law." },
      ],
    },
    {
      id: "acl",
      heading: "Your rights under the Australian Consumer Law",
      blocks: [
        { type: "p", text: "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. For a major failure with a product you are entitled to a replacement or refund, and to compensation for any other reasonably foreseeable loss or damage." },
        { type: "p", text: "For a problem that does not amount to a major failure, you are entitled to have the goods repaired or replaced within a reasonable time, or to a refund if that cannot be done. Any manufacturer warranty offered with a product is in addition to these rights, not instead of them." },
      ],
    },
    {
      id: "warranty",
      heading: "Warranty claims",
      blocks: [
        { type: "p", text: "If you believe a product is faulty, contact us as soon as you notice the issue and keep your proof of purchase. We may need to inspect the product, or refer it to the manufacturer, before resolving a claim." },
        { type: "p", text: "Warranties and consumer guarantees do not cover normal wear and tear, natural variation in the product, damage after delivery, or problems caused by incorrect installation, preparation, handling, cleaning or use." },
        { type: "p", text: "Warranties and consumer guarantees also do not cover packaging. Because tiles are waterproof, boxes and packaging can be exposed to moisture during storage or transit, which may roughen, mark or deteriorate the packaging without affecting the performance or quality of the product inside. You agree that the condition of packaging is not the responsibility of OnWood Tiles, and that marked or damaged packaging is not a fault and is not eligible for return or refund." },
      ],
    },
    {
      id: "liability",
      heading: "Our liability",
      blocks: [
        { type: "p", text: "Nothing in these terms excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law. Subject to that, and to the extent the law allows, our liability for any product is limited, at our option, to replacing or resupplying the product or paying the cost of doing so, or refunding the price you paid." },
        { type: "p", text: "To the extent the law allows, we are not liable for installation or labour costs, or for any indirect or consequential loss, arising in connection with the products we supply." },
      ],
    },
    {
      id: "privacy",
      heading: "Privacy",
      blocks: [
        { type: "p", text: "We collect only the information we need to quote, process and deliver your order and to keep in touch with you about it, and we handle it in line with our privacy obligations and applicable privacy laws. Please contact us if you have any questions about your information." },
      ],
    },
    {
      id: "general",
      heading: "General",
      blocks: [
        { type: "p", text: `These terms are governed by the laws of ${B.state}, Australia, and you and we submit to the courts of that state. If any part of these terms is found to be unenforceable, the rest continues to apply.` },
      ],
    },
    {
      id: "contact",
      heading: "Contact us",
      blocks: [
        { type: "p", text: `Questions about these terms or an order? Email ${B.email} or drop in to the showroom at ${B.addressLine1}, ${B.addressLine2}.` },
      ],
    },
  ],
};

// ── Terms of Website Use ─────────────────────────────────────────────────────
export const WEBSITE_TERMS: LegalDoc = {
  eyebrow: "Website Terms",
  title: "Terms of Website Use",
  intro:
    "These terms cover your use of the OnWood Tiles website. By browsing or using the site you agree to them. If you buy products from us, our Terms of Service apply as well.",
  sections: [
    {
      id: "about-site",
      heading: "About this website",
      blocks: [
        { type: "p", text: `This website, onwoodtiles.com.au, is operated by ${B.name} (ABN ${B.abn}). In these terms "we", "us" and "our" mean ${B.name}, and "you" means the person using the site.` },
      ],
    },
    {
      id: "using",
      heading: "Using the site",
      blocks: [
        { type: "p", text: "You may use this site to browse our range, check availability, get inspiration, contact us, and, if you are an approved trade partner, to order. In return, you agree to use it responsibly. You must not:" },
        { type: "list", items: [
          "use the site in a way that breaks the law or infringes anyone else's rights",
          "attempt to gain unauthorised access to the site, its systems or another user's account",
          "interfere with, disrupt or overload the site, or introduce anything harmful such as viruses or malicious code",
          "scrape, harvest, copy or systematically collect content, images, pricing or stock data from the site by automated or manual means, except as we expressly allow",
        ] },
      ],
    },
    {
      id: "accounts",
      heading: "Trade partner accounts",
      blocks: [
        { type: "p", text: "Some features are available only through a trade partner account that we provide. If you have one, keep your login details secure, do not share them, and let us know straight away if you think your account has been misused." },
        { type: "p", text: "You are responsible for activity that happens under your account. Pricing shown in a trade account is confidential to that account and must not be shared. We may suspend or close an account that is misused or that breaches these terms or the terms of the account." },
      ],
    },
    {
      id: "product-info",
      heading: "Product information, colours and availability",
      blocks: [
        { type: "p", text: "We work hard to keep product details, images, specifications, stock levels and pricing accurate, but everything on the site is provided as a guide and can change without notice." },
        { type: "p", text: "Colours shown on your screen will differ from the real product, so always confirm a choice from a current physical sample. Stock and availability shown are indicative only and are not a guarantee that a product is in stock. Advertised specials show a price; everyday products show availability rather than a price." },
      ],
    },
    {
      id: "errors",
      heading: "Errors and corrections",
      blocks: [
        { type: "p", text: "The site may occasionally contain errors, or be incomplete or out of date. We may correct any information, and we may decline or cancel an order that was based on an error in pricing, availability or product information, at any time." },
      ],
    },
    {
      id: "ip",
      heading: "Intellectual property",
      blocks: [
        { type: "p", text: "The site and everything on it, including text, photography, images, graphics, logos, layout and the OnWood name and branding, is owned by or licensed to us and is protected by intellectual property laws." },
        { type: "p", text: "You may view the site and share links to it for your own personal, non-commercial use. You may not copy, reproduce, republish, distribute, modify, scrape or use any of our content or images for any other purpose without our written permission." },
      ],
    },
    {
      id: "links",
      heading: "Links to other sites",
      blocks: [
        { type: "p", text: "The site may contain links to websites we do not operate or control, such as suppliers, manufacturers or social media. We provide those links for convenience only and are not responsible for the content, products or privacy practices of any third-party site." },
      ],
    },
    {
      id: "availability",
      heading: "Availability of the site",
      blocks: [
        { type: "p", text: "We aim to keep the site available and running smoothly, but we do not guarantee that it will always be available, uninterrupted or error-free. We may change, suspend or withdraw all or part of the site at any time without notice." },
      ],
    },
    {
      id: "liability-site",
      heading: "Disclaimers and liability",
      blocks: [
        { type: "p", text: "The site and its content are provided on an “as is” basis. To the extent the law allows, we are not liable for any loss or damage arising from your use of, or reliance on, the site or anything on it." },
        { type: "p", text: "Nothing in these terms excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law or other laws that cannot be excluded." },
      ],
    },
    {
      id: "privacy-site",
      heading: "Privacy",
      blocks: [
        { type: "p", text: "When you use the site or get in touch through it, we collect only the information we need to respond to you and to run the site, and we handle it in line with applicable privacy laws. Contact us if you have any questions about your information." },
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      blocks: [
        { type: "p", text: "We may update these terms from time to time. The version published on the site applies each time you use it, so please check back when you visit." },
      ],
    },
    {
      id: "law-site",
      heading: "Governing law",
      blocks: [
        { type: "p", text: `These terms are governed by the laws of ${B.state}, Australia, and you and we submit to the courts of that state.` },
      ],
    },
    {
      id: "contact-site",
      heading: "Contact us",
      blocks: [
        { type: "p", text: `Questions about these terms? Email ${B.email} or drop in to the showroom at ${B.addressLine1}, ${B.addressLine2}.` },
      ],
    },
  ],
};
