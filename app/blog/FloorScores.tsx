// The scored floor-covering comparison for the flagship flooring guide. Rendered
// in the post body via the [[floor-scores]] markdown directive. Static, honest
// editorial scoring (each criterion out of 5; overall = the average, x20 = /100).
// Deliberately NOT tile-biased: the numbers land where they truthfully land, and
// the guide's prose explains why the right floor depends on the room, not the
// raw average. Server component (no hooks).

import { CRITERIA, FLOORS, overall, band } from "../../lib/floorScores";

const ROOMS = [
  { room: "Bathroom & ensuite", pick: "Porcelain tile", why: "Fully waterproof and slip-rated, the safe long-term choice where water rules." },
  { room: "Kitchen", pick: "Porcelain or hybrid", why: "Both shrug off spills, grease and dropped pans and wipe clean in seconds." },
  { room: "Living & dining", pick: "Timber-look porcelain or timber", why: "The warmth of timber, with tile toughness if the room sees heavy traffic." },
  { room: "Bedrooms", pick: "Carpet or timber", why: "Where bare feet land first, comfort and warmth underfoot win over hard surfaces." },
  { room: "Media room", pick: "Carpet", why: "The best sound absorption plus soft, warm comfort, so it stays quiet and cosy through a long movie." },
  { room: "Upstairs", pick: "Hybrid or carpet", why: "Both soften footfall and impact noise to the rooms below, which is what matters most on a second storey." },
  { room: "Hallway & entry", pick: "Porcelain tile", why: "The hardest-working stretch of the house handles grit, wheels and wet shoes best on tile." },
  { room: "Laundry", pick: "Porcelain or hybrid", why: "Overflows and detergent are no threat to a waterproof floor." },
  { room: "Outdoor & alfresco", pick: "External porcelain or stone", why: "Only tile and stone truly survive UV, rain and Queensland storms outside." },
  { room: "Pool surround", pick: "R11 porcelain or stone", why: "Grippy when wet, cool underfoot and unbothered by chlorine and sun." },
];

const SCENARIOS = [
  { situation: "Rental property", pick: "Tile, vinyl or carpet", why: "Tile is the most durable and can outlast many tenancies; vinyl and carpet are cheap enough to refresh between tenants without pain." },
  { situation: "Low-traffic luxury home", pick: "Natural stone or timber", why: "Where wear is light, natural stone and engineered timber deliver the most impressive, genuinely luxurious feel underfoot." },
  { situation: "Short-term resale", pick: "Carpet or laminate", why: "Carpet is the cheapest way to make a home present clean and fresh; laminate gives the most convincing timber look on a tight budget." },
  { situation: "Apartment living", pick: "Hybrid", why: "The best acoustic rating for keeping impact noise off the neighbours below, though most floors work with the right acoustic underlay." },
  { situation: "Wheelchair access", pick: "Porcelain or vinyl plank", why: "Both take the pressure and constant movement of wheels with little long-term wear, and lay flat and level for an easy roll." },
  { situation: "Children & pets", pick: "Porcelain or vinyl plank", why: "Spill-proof, scratch-friendly and quick to wipe clean, so muddy paws and dropped cups are no drama." },
  { situation: "Allergies or asthma", pick: "Porcelain, hybrid or vinyl", why: "Hard floors hold no dust, dander or mould the way carpet can, and wipe fully clean." },
  { situation: "Coastal home", pick: "Porcelain", why: "Shrugs off salt air, sand and wet feet, and flows straight out to the alfresco in a grip finish." },
  { situation: "Holiday or short-stay let", pick: "Porcelain or hybrid", why: "Waterproof, hard-wearing and fast to clean between guests, with no delicate finish to baby." },
  { situation: "Commercial office", pick: "Carpet tiles", why: "Kind to office chairs, quiet underfoot, and any damaged tile lifts out and swaps in one at a time." },
  { situation: "Commercial common areas", pick: "Concrete, vinyl or porcelain", why: "Built for large spans that need minimal expansion and trims, with the toughness to take constant traffic." },
];

export default function FloorScores() {
  return (
    <div className="fs-wrap">
      <div className="fs-tablewrap" role="region" aria-label="Floor covering comparison, scored out of five">
        <table className="fs-table">
          <thead>
            <tr>
              <th className="fs-name">Floor type</th>
              {CRITERIA.map((c) => (
                <th key={c} className="fs-crit">{c}</th>
              ))}
              <th className="fs-ov">Overall</th>
            </tr>
          </thead>
          <tbody>
            {FLOORS.map((f) => {
              const ov = overall(f.scores);
              return (
                <tr key={f.name}>
                  <th className="fs-name" scope="row">
                    <span className="fs-fname">{f.name}</span>
                    <span className="fs-ftag">{f.tag}</span>
                  </th>
                  {f.scores.map((s, i) => (
                    <td key={i} className="fs-cellwrap">
                      <span className="fs-cell" data-s={s} aria-label={`${CRITERIA[i]}: ${s} out of 5`}>
                        <span className="fs-bar" style={{ width: `${s * 20}%` }} />
                        <span className="fs-num">{s}</span>
                      </span>
                    </td>
                  ))}
                  <td className="fs-ovcell">
                    <span className="fs-ovbadge" data-b={band(ov)}>{ov}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="fs-legend">
        Each measure is scored out of 5 where 5 is best for the buyer. Value = affordable to buy and lay, Water = wet areas and outdoors, Comfort = warmth and softness underfoot, Upkeep = easy to keep clean, Expansion = dimensional stability so it barely moves and needs no big expansion gaps, Trims = how cleanly it finishes at walls and doorways with few transition strips, Acoustics = how quiet it is underfoot. Overall is the average as a score out of 100. Read it alongside the room guide below, because the best floor is the one that fits the room, not the one with the highest average.
      </p>

      <h3 className="fs-roomtitle">The best floor for each room</h3>
      <div className="fs-rooms">
        {ROOMS.map((r) => (
          <div key={r.room} className="fs-room">
            <span className="fs-rname">{r.room}</span>
            <span className="fs-rpick">{r.pick}</span>
            <span className="fs-rwhy">{r.why}</span>
          </div>
        ))}
      </div>

      <h3 className="fs-roomtitle">The best floor for your situation</h3>
      <div className="fs-rooms">
        {SCENARIOS.map((s) => (
          <div key={s.situation} className="fs-room">
            <span className="fs-rname">{s.situation}</span>
            <span className="fs-rpick">{s.pick}</span>
            <span className="fs-rwhy">{s.why}</span>
          </div>
        ))}
      </div>

      <style>{`
        .fs-wrap{width:min(1060px,calc(100vw - 28px));margin:34px 0 34px 50%;transform:translateX(-50%)}
        .fs-tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:16px;background:var(--surface);-webkit-overflow-scrolling:touch}
        .fs-table{border-collapse:collapse;width:100%;min-width:1180px;font-family:var(--font-manrope),system-ui,sans-serif}
        .fs-table thead th{position:sticky;top:0;background:var(--deep);color:#f6f1e8;font-size:11.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:12px 10px;text-align:center;white-space:nowrap}
        .fs-table thead th.fs-name{text-align:left}
        .fs-table th.fs-name{position:sticky;left:0;z-index:2;background:var(--surface);text-align:left;padding:12px 14px;min-width:190px;border-right:1px solid var(--line)}
        .fs-table thead th.fs-name{background:var(--deep)}
        .fs-fname{display:block;font-family:var(--font-archivo);font-weight:800;font-size:15.5px;color:var(--ink);letter-spacing:-.01em}
        .fs-ftag{display:block;font-size:11.5px;color:var(--muted);margin-top:2px;font-weight:600}
        .fs-table tbody tr{border-top:1px solid var(--line)}
        .fs-table tbody tr:nth-child(even) th.fs-name,.fs-table tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--ink) 3%,var(--surface))}
        .fs-cellwrap{padding:10px 8px;text-align:center;vertical-align:middle}
        .fs-cell{position:relative;display:flex;align-items:center;gap:7px;justify-content:flex-start;width:78px;margin:0 auto;height:20px;background:#ece7dd;border-radius:999px;padding:0 8px 0 0;overflow:hidden}
        .fs-bar{position:absolute;left:0;top:0;bottom:0;border-radius:999px}
        .fs-num{position:relative;margin-left:auto;font-size:12px;font-weight:800;color:#3a3a36}
        .fs-cell[data-s="1"] .fs-bar{background:#c65b4e}
        .fs-cell[data-s="2"] .fs-bar{background:#d98a4b}
        .fs-cell[data-s="3"] .fs-bar{background:#d9b23a}
        .fs-cell[data-s="4"] .fs-bar{background:#7fa65a}
        .fs-cell[data-s="5"] .fs-bar{background:#4a8f6b}
        .fs-ovcell{padding:10px 12px;text-align:center}
        .fs-ovbadge{display:inline-block;min-width:44px;padding:6px 10px;border-radius:10px;font-family:var(--font-archivo);font-weight:900;font-size:16px;color:#fff}
        .fs-ovbadge[data-b="a"]{background:#4a8f6b}
        .fs-ovbadge[data-b="b"]{background:#7fa65a}
        .fs-ovbadge[data-b="c"]{background:#d9a83a;color:#3a2f12}
        .fs-ovbadge[data-b="d"]{background:#c67f4e}
        .fs-legend{font-size:13.5px;line-height:1.6;color:var(--muted);margin:12px 4px 0;max-width:760px}
        .fs-roomtitle{font-family:var(--font-archivo);font-weight:800;letter-spacing:-.02em;font-size:clamp(22px,2.6vw,28px);margin:30px 0 14px;color:var(--ink)}
        .fs-rooms{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
        .fs-room{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:15px 16px;display:flex;flex-direction:column;gap:4px}
        .fs-rname{font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
        .fs-rpick{font-family:var(--font-archivo);font-weight:800;font-size:17px;color:var(--ink);letter-spacing:-.01em}
        .fs-rwhy{font-size:13.5px;line-height:1.55;color:#5a6067}
      `}</style>
    </div>
  );
}
