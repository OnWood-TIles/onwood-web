import type { LegalDoc } from "./legal";

export const TERMS_OF_SALE: LegalDoc = {
  eyebrow: "Terms of Sale",
  title: "Terms and Conditions of Sale",
  intro:
    "OnWood Tiles (ABN 41 522 687 021) is a family owned and operated tile and flooring supplier based at 2/11 Packer Road, Baringa QLD 4551. OnWood Tiles is a registered business name of Reagan Genrich (sole trader). In these terms, \"we\", \"us\" and \"our\" mean OnWood Tiles, and \"you\" means the person or business buying from us.",
  sections: [
    {
      id: "about-us",
      heading: "About us",
      blocks: [
        { type: "p", text: "OnWood Tiles (ABN 41 522 687 021) is a family owned and operated tile and flooring supplier based at 2/11 Packer Road, Baringa QLD 4551. OnWood Tiles is a registered business name of Reagan Genrich (sole trader). In these terms, \"we\", \"us\" and \"our\" mean OnWood Tiles, and \"you\" means the person or business buying from us." },
        { type: "p", text: "We are a supplier of products. We do not carry out tiling, flooring or installation work. You can reach us any time at sales@onwoodtiles.com.au or at the Baringa showroom." },
      ],
    },
    {
      id: "these-terms",
      heading: "These terms",
      blocks: [
        { type: "p", text: "By placing an order with us - in person, over the phone, by email, or by submitting an order request through our trade portal - you agree to these terms. We may update them from time to time; the version current when we accept your order is the one that applies to that order." },
        { type: "p", text: "These terms apply in addition to our Website Terms of Use and our Privacy Policy. If there is any inconsistency in relation to a sale, these terms prevail." },
      ],
    },
    {
      id: "quotes-and-pricing",
      heading: "Quotes and pricing",
      blocks: [
        { type: "p", text: "Unless we say otherwise, a written quote is valid for 30 days. Prices are in Australian dollars and, unless stated, include GST." },
        { type: "p", text: "Prices can change, and a quote does not guarantee stock. We confirm the final price when we accept your order. On our website, advertised specials show a price; everyday products show availability rather than a price, and pricing for trade partners is set per their account." },
        { type: "p", text: "Freight is quoted separately unless the quote says otherwise (see clause 11)." },
      ],
    },
    {
      id: "samples-colour-imagery-and-natural-variation",
      heading: "Samples, colour, imagery and natural variation",
      blocks: [
        { type: "p", text: "Samples, swatches and display pieces are a guide only. Tiles, natural stone, stone veneer and timber-look products naturally vary in shade, tone, veining, texture, size and finish between production runs, and sometimes within the same run. This variation is a normal characteristic of the product, not a fault." },
        { type: "p", text: "Colours shown on a screen or in print will differ from the real product. Some images on our website and in our marketing are generated using artificial intelligence, or are digitally rendered, to illustrate how a product may look installed. They are illustrations, not photographs of the actual product, and colour, scale, tile size, layout, grout colour, joint width, pattern and finish may differ materially from the real thing. They are not a representation about any product's appearance, dimensions, finish or suitability." },
        { type: "p", text: "Please confirm every selection from a current physical sample before you order. We are happy to provide or loan samples." },
        { type: "p", text: "Natural stone and stone veneer (stacker stone) vary the most. Because the material is quarried rather than manufactured, expect colour movement, mineral inclusions, fossils, pitting, fissures, natural filling, and variation in the size, shape and thickness of individual pieces. For stone veneer, coverage per box or pallet is approximate because the pieces are irregular, and your actual coverage depends on corner-piece requirements and how the product is jointed. A sample shows one small piece of a variable product; the range across a full order can be considerably wider." },
        { type: "p", text: "Many stone and stone veneer products require sealing before and/or after installation and have specific cleaning requirements. Acidic or abrasive cleaners can permanently damage stone. Always follow the manufacturer's data sheet." },
        { type: "p", text: "Because batches vary, we strongly recommend ordering everything you need for a job, plus wastage, in one order so it comes from the same batch or dye lot. Re-orders may not match." },
      ],
    },
    {
      id: "batches-dye-lots-and-matching",
      heading: "Batches, dye lots and matching",
      blocks: [
        { type: "p", text: "Batch consistency is one of the most important things to get right with tiles and flooring. Tiles, stone and timber-look products are made in production runs, or dye lots, that can vary from one batch to the next in shade, tone, size or calibre, and finish. Product from a single batch is the most consistent." },
        { type: "p", text: "We cannot guarantee that a re-order, top-up or later purchase will come from, or match, an earlier batch. Once a batch is sold out, the manufacturer may not make any more of that exact batch, and a replacement batch can differ noticeably. For this reason we strongly recommend ordering everything you need for a job, plus wastage, in a single order." },
        { type: "p", text: "If you need product to match tiles you already have, or to match across more than one order or area, it is your responsibility to tell an OnWood Tiles staff member at the time of ordering. We will do our best to supply from one batch, or to match your existing tile, but we cannot guarantee a match and may need to see a sample of your existing product. Where you have not told us that a specific batch or a match was required, we are not responsible for variation between batches." },
        { type: "p", text: "When laying your tiles we recommend working from several boxes at once and mixing the pieces across the area, which helps blend the natural variation for the best result." },
      ],
    },
    {
      id: "orders-and-acceptance",
      heading: "Orders and acceptance",
      blocks: [
        { type: "sub", text: "An order is a request to buy until we confirm it." },
        { type: "p", text: "If you submit an order request through our trade portal, that request notifies our team. It is not an order, it does not reserve stock, and it does not create a contract. We do not take payment through our website." },
        { type: "p", text: "An order is confirmed only when we issue you a quote acceptance, order confirmation or deposit invoice from our system and:" },
        { type: "list", items: [
          "for in-stock orders, we receive payment; or",
          "for special or indent orders, we receive your deposit.",
        ] },
        { type: "p", text: "Until an order is confirmed, price, availability, batch and lead time are not locked in." },
        { type: "p", text: "We may decline or cancel an order - for example if a product is unavailable, if a price or product detail was listed in error, or if we cannot obtain the product from our supplier. If we do, we will let you know as soon as reasonably practicable and refund any payment you have made for that order in full." },
      ],
    },
    {
      id: "special-and-indent-orders",
      heading: "Special and indent orders",
      blocks: [
        { type: "p", text: "Products we do not normally hold in stock are ordered in specifically for you. Because they are bought to fill your order, special and indent orders cannot be cancelled or changed, and are not refundable for change of mind, once they have been placed with our supplier, except where the Australian Consumer Law requires otherwise." },
        { type: "p", text: "Any lead time we give for a special order is an estimate. We are not responsible for delays outside our reasonable control, such as supplier, manufacturing, shipping, customs or freight delays. We will keep you informed if we become aware of a delay." },
      ],
    },
    {
      id: "deposits-and-payment",
      heading: "Deposits and payment",
      blocks: [
        { type: "p", text: "A deposit of 50 percent, or as set out in your quote, is required to place a special or indent order. The balance is payable in full on completion of your order, or before the goods are collected or delivered, whichever comes first." },
        { type: "p", text: "How you can pay. We accept cash, EFTPOS or card in person at the showroom, card payment over the phone, and bank transfer. We do not accept cheque or any form of payment other than those listed. We do not accept payment through our website." },
        { type: "p", text: "Card payments. Credit card payments may incur a surcharge, which will be disclosed to you before the payment is processed and will not exceed our cost of accepting that card type. Card payments are processed through our EFTPOS terminal and our bank. We do not store full card numbers." },
        { type: "p", text: "Payments over the phone. You can pay by card over the phone. Card details given over the phone are entered directly into our terminal at the time of the call and are not written down or retained. Please do not send card details by email, text message or through our website - they are not secure channels and we will not accept them. For a card-not-present payment we may ask you to confirm details of your order or account before we process it, and we may decline to process a payment where we cannot reasonably verify who you are." },
        { type: "p", text: "Goods are released on cleared funds. Where you pay by bank transfer, goods are released for collection or delivery once the funds have cleared into our account." },
        { type: "p", text: "Approved trade partners may purchase on account in line with their agreed account terms. Unless we agree otherwise in writing, accounts are payable within 30 days of the end of the month in which we invoice you (30 days EOM)." },
        { type: "p", text: "If an account is not paid by its due date, we may charge interest on the overdue amount at 10 percent per annum, calculated daily from the due date until the amount is paid in full, and a monthly account administration charge of $25 for each month or part month the account remains overdue. We may also recover the reasonable costs of collecting an overdue amount, including debt recovery and legal costs, and we may place the account on hold or withdraw credit while an amount is overdue." },
      ],
    },
    {
      id: "title-risk-and-security-interest",
      heading: "Title, risk and security interest",
      blocks: [
        { type: "p", text: "Title. Title to the goods stays with us until they are paid for in full, including any related freight and charges." },
        { type: "p", text: "Risk. Risk in the goods passes to you on delivery or collection (see clause 12)." },
        { type: "p", text: "Security interest (PPSA). Until you have paid for the goods in full:" },
        { type: "list", items: [
          "these terms create a security interest in the goods, and in their proceeds, in our favour under the Personal Property Securities Act 2009 (Cth)",
          "you consent to us registering that security interest on the Personal Property Securities Register and agree to provide any information we reasonably need to do so",
          "you must not sell, encumber or part with possession of the goods in a way that is inconsistent with our interest, other than in the ordinary course of your business",
          "where you resell the goods before paying us, you hold the proceeds on trust for us",
          "if you default, we may enter any premises where the goods are located, at a reasonable time and on reasonable notice, to recover them",
          "you waive your right to receive a verification statement under section 157 of the PPSA",
        ] },
      ],
    },
    {
      id: "quantities-coverage-and-wastage",
      heading: "Quantities, coverage and wastage",
      blocks: [
        { type: "p", text: "You are responsible for measuring your space and ordering the right quantity. We are happy to help you estimate, but any coverage figure or calculation we provide is a guide only." },
        { type: "p", text: "Always allow extra for cuts, wastage, breakage and future repairs. As a general guide we recommend at least 10 percent extra, and more for awkward or irregularly shaped areas, unique or feature installation patterns, and large-format tiles. We are not responsible for shortfalls caused by under-ordering, and a top-up order may come from a different batch." },
      ],
    },
    {
      id: "freight-and-delivery-charges",
      heading: "Freight and delivery charges",
      blocks: [
        { type: "p", text: "You can collect your order from our Baringa showroom, or we can arrange delivery for a fee quoted at the time of order." },
        { type: "p", text: "Freight cost and timeframe vary considerably depending on:" },
        { type: "list", items: [
          "the courier or carrier used for that consignment",
          "where the stock is coming from - our warehouse, a supplier's warehouse, or a manufacturer, which may be interstate or overseas",
          "the delivery destination, and whether it is metropolitan, regional or remote",
          "the weight, fragility, pallet configuration and total volume of the order",
          "site access, and whether a tail-lift, hand-unload or forklift is required",
          "current carrier capacity and seasonal demand",
        ] },
        { type: "p", text: "Any freight cost or delivery timeframe we give before your order is confirmed is an estimate, not a guarantee. If freight cost or timing is important to your program, please contact us before ordering and we will give you the most accurate quote and timeframe we can for your specific product, quantity and address." },
        { type: "p", text: "Delivery is to the kerbside or nearest accessible point unless we have agreed otherwise in writing. Someone must be available to receive and check the delivery. If delivery cannot be completed because the site is inaccessible, no one is available, or the details given to us were incorrect, a redelivery fee may apply." },
      ],
    },
    {
      id: "collection-checking-your-goods-and-risk",
      heading: "Collection, checking your goods and risk",
      blocks: [
        { type: "p", text: "Please check your goods on collection or delivery." },
        { type: "p", text: "Tell us about any visible damage, shortage or incorrect item within 48 hours of collection or delivery so we can put it right. Please keep the affected product and its packaging so we can inspect it." },
        { type: "p", text: "Risk in the goods passes to you once you or your carrier collects them, or once they are delivered to your nominated address. If you send a carrier or third party to collect, they collect as your agent." },
        { type: "p", text: "Where we load your vehicle, we do so as a courtesy. Securing and restraining the load, and ensuring the vehicle is suitable and legally loaded, is your responsibility. Tiles and stone are much heavier than most people expect - please ask us for the weight of your order before you come." },
        { type: "p", text: "Reporting an issue after 48 hours does not affect any right you have under the Australian Consumer Law, but it can make it harder for us to establish what happened, and to make a claim on the carrier or supplier." },
      ],
    },
    {
      id: "breakage-and-minor-transit-damage",
      heading: "Breakage and minor transit damage",
      blocks: [
        { type: "p", text: "Tile is fragile by nature, and a small amount of chipping or breakage during freight, handling and packing is normal for any tile order. Minor chipped or broken pieces can usually still be used - for example for cuts, at the edges of a room, or at the start and end of runs - and allowing for this is one of the reasons we recommend ordering extra for wastage." },
        { type: "p", text: "Because of this, a small amount of damage within an order does not on its own warrant a replacement or refund. Where an order arrives with excessive damage or breakage, we will assess it and decide whether a replacement, credit or other rectification is appropriate." },
        { type: "p", text: "Please report any concern within 48 hours of collection or delivery, and keep the affected product and its packaging so we can inspect it." },
        { type: "p", text: "Nothing in this clause limits your rights under the Australian Consumer Law." },
      ],
    },
    {
      id: "we-supply-we-do-not-install",
      heading: "We supply, we do not install",
      blocks: [
        { type: "p", text: "OnWood Tiles supplies products only. We do not provide tiling, flooring, waterproofing or installation services." },
        { type: "p", text: "Any guidance we offer on suitability, setting out or installation is general information, not a professional recommendation for your specific project. We recommend you engage a licensed, qualified tiler or installer, and that installation complies with AS 3958 and all applicable waterproofing and building requirements. We are not responsible for installation, surface preparation, waterproofing, setting out, workmanship or the finished result." },
        { type: "p", text: "Please inspect every product before it is installed, and do not install product you are not happy with. Tiles should be checked for shade, calibre, size, finish and obvious damage before laying, and dry-laid where practical." },
        { type: "p", text: "If a product has a defect that was reasonably visible before installation and it is installed anyway, that may affect what remedy is reasonable in the circumstances, and we are not responsible for the cost of removing or re-laying it. This does not apply to a defect that was not reasonably visible before installation, and nothing in this clause limits your rights under the Australian Consumer Law." },
      ],
    },
    {
      id: "returns-and-change-of-mind",
      heading: "Returns and change of mind",
      blocks: [
        { type: "p", text: "We generally do not accept returns for change of mind, and you are not entitled to a refund or exchange simply because you have changed your mind." },
        { type: "p", text: "If you ask to return a product for change of mind, whether we accept it is at our discretion. It will depend on whether our supplier will accept the return, and on the current stock levels of the batch being returned. Where we do agree to a change-of-mind return, it must be full, unopened boxes of current stock, in resaleable condition, with proof of purchase. We may withhold part of the amount paid to cover freight and handling, administration costs, and any restocking or return penalties charged by our supplier." },
        { type: "p", text: "We cannot accept change-of-mind returns of special or indent orders, clearance or discontinued items, or products that have been opened, cut, used or installed." },
        { type: "p", text: "Batch, variation and availability issues. Where a concern arises about batch variation, matching or availability, we will look at it with you and, where relevant, with our supplier. We may offer a refund, credit, exchange or replacement. Which remedy we offer, if any, is at our discretion and may depend on our supplier's response - except where the Australian Consumer Law entitles you to a particular remedy, in which case that law applies." },
        { type: "p", text: "None of this limits your rights under the Australian Consumer Law." },
      ],
    },
    {
      id: "your-rights-under-the-australian-consumer-law",
      heading: "Your rights under the Australian Consumer Law",
      blocks: [
        { type: "p", text: "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. For a major failure with a product you are entitled to a replacement or refund, and to compensation for any other reasonably foreseeable loss or damage." },
        { type: "p", text: "For a problem that does not amount to a major failure, you are entitled to have the goods repaired or replaced within a reasonable time, or to a refund if that cannot be done." },
      ],
    },
    {
      id: "manufacturer-warranties",
      heading: "Manufacturer warranties",
      blocks: [
        { type: "p", text: "Where a product carries a manufacturer's warranty, we pass that warranty on to you and will help you make a claim under it. The terms, length and conditions of that warranty are set by the manufacturer, not by us." },
        { type: "p", text: "We do not offer any separate or additional warranty of our own beyond the manufacturer's warranty." },
        { type: "p", text: "Your rights under the Australian Consumer Law are separate, and are not limited by any manufacturer's warranty. The consumer guarantees apply for a reasonable period having regard to the nature of the product, the price paid and any statements made about it - and that period may be longer than the manufacturer's warranty period. A manufacturer's warranty is in addition to your rights under the Australian Consumer Law, not instead of them." },
      ],
    },
    {
      id: "warranty-and-product-claims",
      heading: "Warranty and product claims",
      blocks: [
        { type: "p", text: "If you believe a product is faulty, contact us as soon as you notice the issue and keep your proof of purchase. We may need to inspect the product, or refer it to the manufacturer, before resolving a claim. Please keep the product and, where you still have it, its packaging." },
        { type: "p", text: "Manufacturer warranties do not cover normal wear and tear, natural variation in the product, damage after delivery, or problems caused by incorrect installation, preparation, handling, cleaning or use." },
        { type: "p", text: "Packaging. Tiles are waterproof; their boxes and packaging are not. Cartons, shrink wrap and pallet packaging are exposed to moisture, handling and stacking during storage and transit, and can roughen, mark, stain or deteriorate without any effect at all on the product inside. Packaging is not part of the product you are buying, and marked or damaged packaging on its own is not a fault and is not a basis for a return or refund. If packaging damage suggests the product inside may also be affected, please open the boxes, check the product, and tell us within 48 hours." },
      ],
    },
    {
      id: "our-liability",
      heading: "Our liability",
      blocks: [
        { type: "p", text: "Nothing in these terms excludes, restricts or modifies any right, guarantee or remedy you have under the Australian Consumer Law or any other law that cannot be excluded." },
        { type: "p", text: "Subject to that, and to the extent the law allows:" },
        { type: "list", items: [
          "our liability for any product is limited, at our option, to replacing or resupplying the product, paying the cost of doing so, or refunding the price you paid",
          "we are not liable for installation or labour costs, including the cost of removing or re-laying product",
          "we are not liable for any indirect or consequential loss, or for loss of profit, revenue, contract or opportunity",
          "our total liability in connection with an order does not exceed the price you paid for that order",
        ] },
      ],
    },
    {
      id: "events-outside-our-control",
      heading: "Events outside our control",
      blocks: [
        { type: "p", text: "We are not liable for any failure or delay in supplying goods caused by something outside our reasonable control - including supplier or manufacturing failure, shipping, port, customs or freight delays, carrier failure, extreme weather, flood, fire, natural disaster, pandemic, industrial action, or failure of utilities or transport networks. Where such an event occurs we will tell you as soon as reasonably practicable and work with you on an alternative, a rescheduled supply, or a refund of amounts paid for goods we cannot supply." },
      ],
    },
    {
      id: "privacy",
      heading: "Privacy",
      blocks: [
        { type: "p", text: "We handle personal information in accordance with our Privacy Policy, available at onwoodtiles.com.au. It explains what we collect, why, who we share it with, how we use it for marketing, and how you can opt out, access or correct it." },
      ],
    },
    {
      id: "general",
      heading: "General",
      blocks: [
        { type: "list", items: [
          "If any part of these terms is found to be unenforceable, it is severed and the rest continues to apply.",
          "If we do not enforce a right, that is not a waiver of it.",
          "These terms, together with your quote or order confirmation, are the entire agreement between us about your order and replace any earlier discussion or representation.",
          "You may not assign your rights under these terms without our written consent. We may assign ours in connection with a sale or restructure of our business.",
          "Clauses 9, 17, 18, 19 and this clause 22 survive completion of your order.",
          "These terms are governed by the laws of Queensland, Australia. You and we submit to the non-exclusive jurisdiction of the courts of Queensland and the courts entitled to hear appeals from them.",
        ] },
      ],
    },
    {
      id: "contact-us",
      heading: "Contact us",
      blocks: [
        { type: "p", text: "Questions about these terms or an order?" },
        { type: "p", text: "OnWood Tiles" },
        { type: "p", text: "2/11 Packer Road, Baringa QLD 4551" },
        { type: "p", text: "sales@onwoodtiles.com.au" },
        { type: "p", text: "0447 766 553" },
        { type: "p", text: "ABN 41 522 687 021" },
      ],
    },
  ],
};
