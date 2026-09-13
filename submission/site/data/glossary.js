/* glossary.js — every term the parents' path uses, in plain English.
   No unexplained abbreviation appears anywhere on parents.html; each term
   here is expanded on first use and linked to its entry (CLAUDE.md §F).
   Rendered with native <details>/<summary>, no JS accordion. */
window.RVU = window.RVU || {};

RVU.glossary = [
  { term: "LPA",
    expansion: "Lakh per annum",
    plain_english: "Lakh per annum — how yearly pay is quoted in India. One lakh is one hundred thousand rupees, so 9 LPA means nine hundred thousand rupees a year.",
    example: "An offer of 9.4 LPA is a salary of ₹9,40,000 for a year of work." },

  { term: "CTC",
    expansion: "Cost to company",
    plain_english: "Cost to company — everything the employer spends on an employee in a year, not the amount that arrives in the bank account. It includes the employer's share of provident fund, insurance and any one-time joining payment.",
    example: "A 12 LPA CTC might be around 9 to 10 LPA of guaranteed cash once the non-cash parts are set aside." },

  { term: "CGPA",
    expansion: "Cumulative grade point average",
    plain_english: "Cumulative grade point average — a running average of a student's grades across every semester so far, on a ten-point scale.",
    example: "Most drives ask for a CGPA between 6.5 and 7.5." },

  { term: "Drive",
    expansion: null,
    plain_english: "A single employer's hiring round on campus: they announce roles, students apply, and the employer interviews and makes offers over a few weeks.",
    example: "A drive that opens on 1 September and closes on 16 September gives students about two weeks to apply." },

  { term: "Pre-placement offer",
    expansion: "PPO",
    plain_english: "A job offer made to a student by the company they interned with, usually before the main hiring cycle begins. It is the most common route from an internship to a full-time job.",
    example: "A student who interns in the summer may hold a pre-placement offer before the final year starts." },

  { term: "Cohort",
    expansion: null,
    plain_english: "The group of students graduating in the same year. Every figure on this site is about one cohort, and each figure says which one.",
    example: "The 2025–26 cohort is every student who graduated in that academic year." },

  { term: "Median",
    expansion: null,
    plain_english: "The middle offer. Line every offer up from smallest to largest and the median is the one in the middle — half the class received more, half less.",
    example: "We lead with the median rather than the highest offer because one exceptional offer tells you nothing about your child's likely outcome." },

  { term: "Mean",
    expansion: "Average",
    plain_english: "The average: add every offer together and divide by the number of offers. A single very large offer pulls the mean upward, which is why the median is the more honest headline.",
    example: "If the mean sits well above the median, a small number of large offers is doing the work." },

  { term: "Denominator",
    expansion: null,
    plain_english: "The number a percentage is calculated out of. A percentage without its denominator is not a fact — 100% of two students is not the same claim as 100% of three hundred.",
    example: "\"287 of 318 students seeking placement received an offer\" states the denominator; \"90% placed\" on its own does not." }
];
