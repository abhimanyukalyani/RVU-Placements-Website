/* recruiters.js — recruiting organisations by sector.
   Set as text in the recruiter strip, never as logos: nobody's mark is misused
   and the result is more editorial than every peer site in the audit.

   PLACEHOLDER. Organisation names are illustrative and must be replaced from
   the placement sheet before ship.
   TODO: confirm the recruiting list against the placement sheet. */
window.RVU = window.RVU || {};

RVU.recruiters = {
  // The count shown beside "Recruiting organisations" is derived from this
  // list by render.js. It is never typed into a page.
  sectors: [
    { sector: "Technology & IT services",
      companies: ["[Organisation 01]", "[Organisation 02]", "[Organisation 03]",
                  "[Organisation 04]", "[Organisation 05]", "[Organisation 06]"] },
    { sector: "Financial services & fintech",
      companies: ["[Organisation 07]", "[Organisation 08]", "[Organisation 09]",
                  "[Organisation 10]"] },
    { sector: "Consulting & professional services",
      companies: ["[Organisation 11]", "[Organisation 12]", "[Organisation 13]"] },
    { sector: "Design, media & creative industries",
      companies: ["[Organisation 14]", "[Organisation 15]", "[Organisation 16]",
                  "[Organisation 17]"] },
    { sector: "Industry, health & public sector",
      companies: ["[Organisation 18]", "[Organisation 19]", "[Organisation 20]"] }
  ]
};
