/* intake-fields.js — the recruiter intake form's field definitions.
   Four steps: stage, role, cohort match, you. "Information only" never sees
   a form. Submit logs a JSON payload shaped as the office's sheet expects.

   TODO: reconcile against the 20-field Corporate Relations sheet.
   Every `sheet_column` below is a guess until that reconciliation happens.
   This is the difference between a plausible form and one the office could
   use on Monday — see PLAN.md §12.2. */
window.RVU = window.RVU || {};

RVU.intakeFields = {

  // TODO: reconcile against the 20-field Corporate Relations sheet
  sheet_reconciled: false,

  steps: [
    { id: "stage", order: 1, legend: "What stage are you at?",
      fields: [
        { name: "intent", label: "What would you like to do?", type: "radio", required: true,
          sheet_column: "Enquiry type",           // TODO: confirm
          options: [
            { value: "now",        label: "We want to hire now" },
            { value: "planning",   label: "We're planning to hire later this year" },
            { value: "internship", label: "We want to offer internships or projects" },
            { value: "info",       label: "We just want information" }
          ] }
      ] },

    { id: "role", order: 2, legend: "The role",
      fields: [
        { name: "function",   label: "Function",             type: "select", required: true,  sheet_column: "Function" },          // TODO: confirm
        { name: "positions",  label: "Number of positions",  type: "number", required: true,  sheet_column: "Headcount" },         // TODO: confirm
        { name: "location",   label: "Location",             type: "text",   required: true,  sheet_column: "Location" },          // TODO: confirm
        { name: "work_term",  label: "Work term",            type: "select", required: true,  sheet_column: "Engagement type",     // TODO: confirm
          options: [
            { value: "8w",        label: "8 weeks" },
            { value: "12w",       label: "12 weeks" },
            { value: "24w",       label: "24 weeks" },
            { value: "full_time", label: "Full-time" }
          ] },
        { name: "start_date", label: "Earliest start date",  type: "date",   required: true,  sheet_column: "Start date" },        // TODO: confirm
        { name: "ctc_band",   label: "Indicative annual package", type: "text", required: false, sheet_column: "CTC band" }        // TODO: confirm
      ] },

    // Step 3 takes no input. The form tells the recruiter something before it
    // asks for anything more: eligible schools, approximate cohort size and
    // the next drive window, computed from RVU.schools and RVU.drives.
    { id: "cohort_match", order: 3, legend: "Your cohort match", fields: [] },

    { id: "you", order: 4, legend: "You",
      fields: [
        { name: "organisation", label: "Organisation",   type: "text",   required: true,  sheet_column: "Company name" },   // TODO: confirm
        { name: "contact_name", label: "Your name",      type: "text",   required: true,  sheet_column: "Contact person" }, // TODO: confirm
        { name: "designation",  label: "Your role",      type: "text",   required: true,  sheet_column: "Designation" },    // TODO: confirm
        { name: "email",        label: "Email",          type: "email",  required: true,  sheet_column: "Email" },          // TODO: confirm
        { name: "phone",        label: "Phone",          type: "tel",    required: true,  sheet_column: "Phone" },          // TODO: confirm
        { name: "website",      label: "Website",        type: "url",    required: false, sheet_column: "Website" },        // TODO: confirm
        { name: "mode",         label: "Preferred mode", type: "select", required: true,  sheet_column: "Mode",             // TODO: confirm
          options: [
            { value: "campus",  label: "On campus" },
            { value: "virtual", label: "Virtual" },
            { value: "hybrid",  label: "Hybrid" }
          ] },
        { name: "notes",        label: "Anything else we should know", type: "textarea", required: false, sheet_column: "Notes" } // TODO: confirm
      ] }
  ],

  // Target service levels, stated on recruiters.html and restated on
  // confirmation. Placeholders, and labelled as targets, not promises.
  service_levels: [
    { step: 1, what: "We acknowledge your request",                    within: "1 working day"  },
    { step: 2, what: "We send a cohort and eligibility shortlist",     within: "3 working days" },
    { step: 3, what: "We confirm your drive slot",                     within: "5 working days" },
    { step: 4, what: "The drive runs",                                 within: "your stated window" }
  ]
};
