/* ============================================================
   Axis PT Intake Kiosk — CONFIGURATION
   This is the only file staff/IT normally need to edit.
   REMINDER: this repo is PUBLIC. Never put patient data,
   passwords, or private links that grant edit access in here.
   ============================================================ */
window.KIOSK_CONFIG = {
  clinicName: "AXIS Physical Therapy",
  logo: "https://axisptutah.com/images/logo-nav.png", // official logo from the website.
                                      // Better: save that file as assets/logo.png and set logo: "assets/logo.png"
                                      // so the kiosk doesn't depend on the website being up.
  frontDeskLabel: "front desk",

  /* Staff PIN, stored as a SHA-256 hash (carried over from the previous version of this kiosk).
     Make a new hash: open any browser console and run
       crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOURPIN'))
         .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
     The PIN only keeps patients out of the setup screen. It is NOT real security
     (the code is public); the real lock is Android app pinning with a PIN. */
  staffPinSha256: "a1fb4e703a9ef1fa4936801721ff285a97ac85330856674412e054892afe6972",

  /* Microsoft Forms (rebuilt Nov 18, 2026 from the revised print PDFs; the older forms are retired).
     Every form has "pre-filled answers" turned on, so nameParam/priceParam work.
     Per form:
     url          share link (Collect responses > Copy link). Leave "" to show "not set up yet".
     nameParam    question ID of the patient-name question, to pre-fill it (from Forms
                  "Get pre-filled link": the part before "=" for that question). Or put
                  PATIENTNAME inside url instead. "" = patient types their own name.
     priceParam   question ID to pre-fill a price; pricePrompt is the label staff see.
                  Staff must enter the price when that form is checked.
     desc         short note for staff on who gets this form. */
  namePlaceholder: "PATIENTNAME",
  forms: [
    { id: "consent", title: "Consent to Evaluation & Treatment", desc: "Every new patient",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UQjdDVEgzWFU2VVFWVUU1NUdBNE5PTEVVVy4u",
      nameParam: "rb846cbf671e6486dbe406891d8f9aa13", checkedByDefault: true },
    { id: "finres", title: "Financial Responsibility", desc: "Every new patient (insurance)",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UQVFGMzJYR1JOM01EQTU0VjlHQUFZQ0MwOS4u",
      nameParam: "r32ff868c8eb44f5598daeb49c8aa7aad", checkedByDefault: true },
    { id: "hipaa", title: "HIPAA Notice of Privacy Practices", desc: "Every new patient",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UNDlWNkYxT0hDNFU2T1dNMjBEWDZRVDBDUi4u",
      nameParam: "r63e9f09c59b94331bc1f53491bdec80c", checkedByDefault: true },
    { id: "pelvic", title: "Pelvic Floor Exam Consent", desc: "Internal pelvic floor exam",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UNElWOVBFMkdVVzhHRlRQNFY5MkNEQlVDOS4u",
      nameParam: "r8ed16a9029bd49ce8c2da4417543fef3", checkedByDefault: false },
    { id: "dryneedling", title: "Dry Needling Consent", desc: "Patients receiving dry needling",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UN1JKMlVaRTZFWlhSVFU1NFhIVVNYR0NOWi4u",
      nameParam: "rb6d1ab9009fe428d838942a93f32627c", checkedByDefault: false },
    { id: "selfpay", title: "Self-Pay Form", desc: "Self-pay / cash-pay patients",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UNkpFQTkzNzBZQVZNUEdXRVM1QVUwVkZMRi4u",
      nameParam: "rb33eb31fb64b41bf9fa0c86249367205", checkedByDefault: false },
    { id: "credentialing", title: "Temporary Credentialing Disclosure", desc: "Patients billed under provisional credentialing",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UOVNCWFEzSE82UUEzNDFWVkFINjk0R0REWC4u",
      nameParam: "r4e77b0cca2e849bfaed1fd85efdb9c70", priceParam: "r786866b4099240318bfa7d001b0bfffb", pricePrompt: "Temporary collected fee", checkedByDefault: false },
    { id: "wellness", title: "Wellness & Supervised Module Intake", desc: "Wellness / supervised module patients",
      minutes: 6, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UOVhaTjgxSko5SFMxMkhJMkVCUDdLQVNHVy4u",
      nameParam: "rdef9c886399a44c09ea6b4078fe608f2", priceParam: "rfa4a7133c281406db346d011cf242eac", pricePrompt: "Cost per visit", checkedByDefault: false }
  ],

  /* WebPT Reach kiosk-mode intake (QR/URL from the patient's Reach chart).
     It appears as the first item in the staff form list. If checked, staff scan the
     WebPT QR code right after setup. position: "first" (default) or "last" in the
     patient's steps. It opens on top of this page; the patient comes back and taps Continue.
     allowedHosts: after your first real scan, put the WebPT host here
     (e.g. the domain shown in the scanned link) so random QR codes are rejected.
     Empty list = accept any https link. */
  webpt: { enabled: true, position: "first", allowedHosts: ["webpt.com"] },

  timeouts: {
    patientQuestionSec: 200,   // no touch for 200 s on a patient screen -> "Are you still there?"
    patientLockSec: 320,       // no answer 120 s after the question -> tablet pauses; staff unlock with PIN to continue
    formQuestionSec: 200,      // same 200 s on Microsoft Form pages (touches inside a form can't be seen,
                               // so time spent typing in the form doesn't reset this); pauses 120 s later
    staffResetSec: 120,        // staff screens left alone -> back to welcome (or back to the pause screen)
    lockAutoResetMin: 30,      // a paused tablet nobody unlocks is wiped after 30 min
    doneAutoResetSec: 90,      // done screen returns to welcome
    iframeLoadSec: 20          // show "trouble loading" help after this
  }
};
