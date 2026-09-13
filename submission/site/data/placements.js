/* placements.js — the university-wide figures.
   Shaped on the IPRS disclosure pattern: every graduate lands in exactly one
   cohort bucket, and the buckets sum to total_graduates. render.js asserts it.

   PLACEHOLDER DATA. Internally consistent, not real. See RVU.meta.status. */
window.RVU = window.RVU || {};

RVU.placements = {

  /* The denominator, visible. Every graduate in exactly one bucket. */
  cohort: {
    total_graduates: 412,

    seeking_through_university: 318,
    continuing_further_study: 46,
    entrepreneurship_or_family_business: 21,
    placed_independently: 19,
    postponing_search: 8,
    // 318 + 46 + 21 + 19 + 8 = 412

    offers_made: 301,      // some students received more than one
    students_placed: 287   // the base of every salary figure below
  },

  /* Never a lone headline. min / max / mean / median, each with its n. */
  salary_inr_lpa: {
    basic:                 { min: 3.6, max: 42.0, mean: 11.2, median: 9.4,  n: 287 },
    guaranteed_cash:       { min: 3.6, max: 48.0, mean: 12.1, median: 10.1, n: 287 },
    max_earning_potential: { min: 3.6, max: 64.0, mean: 13.4, median: 10.8, n: 287 }
  },

  /* IPRS optional reporting: top and bottom decile excluded.
     287 less 28 at each end = 231... rounded to whole students: n = 230. */
  middle_80: {
    basic: { min: 5.2, max: 24.0, mean: 10.1, median: 9.2, n: 230 }
  },

  /* Powers the distribution row and the explorer histogram.
     Counts sum to students_placed. */
  distribution: [
    { label: "Under ₹6 LPA", from: 0,  to: 6,    count: 41  },
    { label: "₹6–10 LPA",  from: 6,  to: 10,   count: 118 },
    { label: "₹10–15 LPA", from: 10, to: 15,   count: 78  },
    { label: "₹15–25 LPA", from: 15, to: 25,   count: 38  },
    { label: "Above ₹25 LPA",  from: 25, to: null, count: 12  }
    // 41 + 118 + 78 + 38 + 12 = 287
  ],

  /* Breakdowns. Each carries the count of data points behind it, so a thin
     cell cannot masquerade as a trend. Each list sums to students_placed. */
  by_sector: [
    { name: "Technology & IT services",        count: 106, min: 4.2, max: 42.0, mean: 12.8, median: 11.0 },
    { name: "Financial services & fintech",    count: 31,  min: 5.0, max: 34.0, mean: 12.4, median: 10.6 },
    { name: "Consulting & professional services", count: 24, min: 4.8, max: 28.0, mean: 11.6, median: 10.2 },
    { name: "Design & creative industries",    count: 19,  min: 3.8, max: 21.0, mean: 8.9,  median: 7.8  },
    { name: "Media, entertainment & gaming",   count: 16,  min: 3.6, max: 24.0, mean: 9.4,  median: 8.0  },
    { name: "Manufacturing & engineering",     count: 15,  min: 4.0, max: 18.0, mean: 8.6,  median: 7.9  },
    { name: "Healthcare & life sciences",      count: 13,  min: 4.4, max: 19.5, mean: 9.1,  median: 8.4  },
    { name: "Education & edtech",              count: 12,  min: 3.8, max: 16.0, mean: 8.2,  median: 7.5  },
    { name: "Retail & e-commerce",             count: 11,  min: 4.2, max: 22.0, mean: 9.8,  median: 8.6  },
    { name: "Energy & sustainability",         count: 9,   min: 4.6, max: 17.0, mean: 9.0,  median: 8.2  },
    { name: "Legal services",                  count: 9,   min: 4.5, max: 20.0, mean: 9.6,  median: 8.8  },
    { name: "Government, policy & development", count: 8,  min: 3.6, max: 14.0, mean: 7.4,  median: 6.9  },
    { name: "Logistics & mobility",            count: 8,   min: 4.0, max: 15.5, mean: 8.3,  median: 7.6  },
    { name: "Real estate & construction",      count: 6,   min: 4.0, max: 13.0, mean: 7.7,  median: 7.1  }
    // sums to 287
  ],

  by_function: [
    { name: "Software engineering",            count: 74, min: 5.0, max: 42.0, mean: 13.6, median: 12.0 },
    { name: "Data & analytics",                count: 34, min: 5.2, max: 34.0, mean: 12.9, median: 11.4 },
    { name: "Product & program management",    count: 26, min: 6.0, max: 30.0, mean: 13.1, median: 11.8 },
    { name: "Design (UX, visual, industrial)", count: 25, min: 3.8, max: 22.0, mean: 9.3,  median: 8.2  },
    { name: "Business development & sales",    count: 24, min: 3.6, max: 20.0, mean: 8.7,  median: 7.6  },
    { name: "Operations & supply chain",       count: 21, min: 4.0, max: 17.0, mean: 8.5,  median: 7.8  },
    { name: "Consulting & strategy",           count: 21, min: 4.8, max: 28.0, mean: 11.9, median: 10.4 },
    { name: "Finance & accounting",            count: 22, min: 4.4, max: 26.0, mean: 10.6, median: 9.3  },
    { name: "Marketing & communications",      count: 20, min: 3.6, max: 18.0, mean: 8.1,  median: 7.2  },
    { name: "Research & teaching",             count: 20, min: 4.2, max: 16.5, mean: 8.4,  median: 7.7  }
    // sums to 287
  ],

  by_location: [
    { name: "Bengaluru",  count: 141, min: 3.6, max: 42.0, mean: 12.2, median: 10.4, region: "India" },
    { name: "Hyderabad",  count: 26,  min: 4.0, max: 28.0, mean: 10.8, median: 9.6,  region: "India" },
    { name: "Mumbai",     count: 22,  min: 4.2, max: 30.0, mean: 11.4, median: 9.9,  region: "India" },
    { name: "Pune",       count: 18,  min: 4.0, max: 24.0, mean: 10.1, median: 9.0,  region: "India" },
    { name: "Delhi NCR",  count: 17,  min: 4.4, max: 26.0, mean: 10.9, median: 9.5,  region: "India" },
    { name: "Chennai",    count: 12,  min: 3.8, max: 20.0, mean: 9.4,  median: 8.6,  region: "India" },
    { name: "Ahmedabad",  count: 7,   min: 3.6, max: 15.0, mean: 8.2,  median: 7.4,  region: "India" },
    { name: "Singapore",  count: 9,   min: 12.0, max: 48.0, mean: 24.6, median: 22.0, region: "Outside India" },
    { name: "Dubai",      count: 8,   min: 10.0, max: 40.0, mean: 20.4, median: 18.5, region: "Outside India" },
    { name: "London",     count: 7,   min: 14.0, max: 52.0, mean: 27.1, median: 24.0, region: "Outside India" },
    { name: "Berlin",     count: 6,   min: 11.0, max: 38.0, mean: 21.3, median: 19.0, region: "Outside India" },
    { name: "Amsterdam",  count: 5,   min: 12.0, max: 36.0, mean: 20.8, median: 18.8, region: "Outside India" },
    { name: "Toronto",    count: 5,   min: 10.5, max: 34.0, mean: 19.2, median: 17.4, region: "Outside India" },
    { name: "Tokyo",      count: 4,   min: 11.5, max: 30.0, mean: 18.6, median: 17.0, region: "Outside India" }
    // sums to 287
  ],

  non_inr_note: "Offers outside India are converted to USD and PPP-adjusted " +
                "using World Bank factors."
};
