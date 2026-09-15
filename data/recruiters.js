/* recruiters.js — recruiting organisations by sector.
   Set as text in the recruiter strip, never as logos: nobody's mark is misused
   and the result is more editorial than every peer site in the audit.

   PLACEHOLDER. Every name is a bracketed placeholder, not an invented company.
   The COUNT is what matters until the sheet lands: 20 organisations against 301
   offers implied 15 offers each, where campus recruiting runs one to five, and
   that figure sits inches from the claim that every number comes from one
   maintained source. render.js now asserts the ratio, so the list and the offer
   count cannot drift apart again.

   TODO: replace these placeholders with the real recruiting list from the
   placement sheet. */
window.RVU = window.RVU || {};

RVU.recruiters = {
  // The count shown beside "Recruiting organisations" is derived from this
  // list by render.js. It is never typed into a page.
  sectors: [
    { sector: "Technology & IT services",
      companies: [
      "[Organisation 01]", "[Organisation 02]", "[Organisation 03]", "[Organisation 04]",
      "[Organisation 05]", "[Organisation 06]", "[Organisation 07]", "[Organisation 08]",
      "[Organisation 09]", "[Organisation 10]", "[Organisation 11]", "[Organisation 12]",
      "[Organisation 13]", "[Organisation 14]", "[Organisation 15]", "[Organisation 16]",
      "[Organisation 17]", "[Organisation 18]", "[Organisation 19]", "[Organisation 20]",
      "[Organisation 21]", "[Organisation 22]", "[Organisation 23]", "[Organisation 24]",
      "[Organisation 25]", "[Organisation 26]", "[Organisation 27]", "[Organisation 28]",
      "[Organisation 29]", "[Organisation 30]", "[Organisation 31]", "[Organisation 32]",
      "[Organisation 33]", "[Organisation 34]" ] },
    { sector: "Financial services & fintech",
      companies: [
      "[Organisation 35]", "[Organisation 36]", "[Organisation 37]", "[Organisation 38]",
      "[Organisation 39]", "[Organisation 40]", "[Organisation 41]", "[Organisation 42]",
      "[Organisation 43]", "[Organisation 44]", "[Organisation 45]", "[Organisation 46]",
      "[Organisation 47]", "[Organisation 48]", "[Organisation 49]", "[Organisation 50]" ] },
    { sector: "Consulting & professional services",
      companies: [
      "[Organisation 51]", "[Organisation 52]", "[Organisation 53]", "[Organisation 54]",
      "[Organisation 55]", "[Organisation 56]", "[Organisation 57]", "[Organisation 58]",
      "[Organisation 59]", "[Organisation 60]", "[Organisation 61]", "[Organisation 62]",
      "[Organisation 63]", "[Organisation 64]" ] },
    { sector: "Design, media & creative industries",
      companies: [
      "[Organisation 65]", "[Organisation 66]", "[Organisation 67]", "[Organisation 68]",
      "[Organisation 69]", "[Organisation 70]", "[Organisation 71]", "[Organisation 72]",
      "[Organisation 73]", "[Organisation 74]", "[Organisation 75]", "[Organisation 76]",
      "[Organisation 77]", "[Organisation 78]", "[Organisation 79]", "[Organisation 80]",
      "[Organisation 81]", "[Organisation 82]" ] },
    { sector: "Industry, health & public sector",
      companies: [
      "[Organisation 83]", "[Organisation 84]", "[Organisation 85]", "[Organisation 86]",
      "[Organisation 87]", "[Organisation 88]", "[Organisation 89]", "[Organisation 90]",
      "[Organisation 91]", "[Organisation 92]", "[Organisation 93]", "[Organisation 94]",
      "[Organisation 95]", "[Organisation 96]" ] }
  ]
};
