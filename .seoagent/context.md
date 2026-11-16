# Business Context

- **Name:** AS Autosearch (Автопідбір)
- **Type:** LOCAL — office in Khmelnytskyi; clients are private buyers across Ukraine; inspectors travel to other cities. Not online-only.
- **Audience:** Private car buyers in Ukraine who worry about hidden costs, a hidden crash history, and wound-back mileage
- **Industry:** Car search and import (pre-purchase inspection and turnkey buying), not a dealership and not a parts catalog
- **Location:** Khmelnytskyi, Ukraine; service area is Ukraine; cars sourced from the USA, Europe, and South Korea
- **Description:** Marketing site whose job is to turn that buying worry into a callback. Main offer is turnkey car search; inspection, expert-for-a-day, computer diagnostics, and travel to other cities sit beside it.

# Facts

- Default language is Ukrainian (`ua`, no URL prefix); English is the second locale (`/en`). — source: specs/07-domain-and-pages.md
- Cars are sourced from the USA, Europe, and South Korea. — source: specs/07-domain-and-pages.md
- Five services: pre-purchase inspection, turnkey car search (main), expert for a day, computer diagnostics, travel to other cities. — source: specs/07-domain-and-pages.md
- One-time inspection prices on the spec sheet: up to $10,000 → 1,500 UAH; up to $20,000 → 2,000 UAH; over $20,000 → 3,000 UAH; over $40,000 → $100. — source: specs/07-domain-and-pages.md
- Inspection add-ons on the spec sheet: service-station inspection +700 UAH; service-history check +700 UAH; comprehensive inspection from $100; expert for a day from $100. Fuel for expert-for-a-day is extra outside Khmelnytskyi. — source: specs/07-domain-and-pages.md
- Turnkey search prices on the spec sheet: up to $10,000 → $400; up to $15,000 → $500; up to $20,000 → $600; up to $30,000 → $700. Travel to another city from 2,000 UAH. — source: specs/07-domain-and-pages.md
- v1 routes in the spec: `/`, `/services/perevirka`, `/services/pid-kliuch`, `/services/ekspert-na-den`, `/services/diagnostyka`, `/services/vyizd`, `/blog`, `/blog/[slug]`. About and Contacts are homepage anchors, not separate routes. — source: specs/07-domain-and-pages.md
- Live prices and page copy are not confirmed: https://autosearch.km.ua/ did not resolve on 2026-11-16 (domain RedemptionPeriod). — source: .seoagent/audit/evidence.md

# Writing Instructions

- Write in Ukrainian for `ua` and English for `en`. Brand name stays AS Autosearch.
- The site sells an inspection and a search, not a car inventory. Do not describe a catalog, a search wizard, new/used/trade-in/finance, or a parts selector.
- Prices above are the spec sheet. Do not publish a price on a page until it is confirmed in the CMS price list or on the live site.

# Reference URLs

- https://autosearch.km.ua/ — configured origin; did not resolve on 2026-11-16

# Topics to Avoid

- Car inventory, brand catalogs, and an Autosearch “search wizard”
- Dealership framing: new, used, trade-in, finance
- Claiming a live price, ranking, or index status that the crawl did not capture

# Content Tone

plain and specific — a specialist explaining the buying risk, not a slogan

# Additional Notes

Office city is Khmelnytskyi. Geo keywords for that city and for Ukraine are in scope because the business is local with a national service area. Confirm this draft before any keyword or content work. The domain must resolve first.
