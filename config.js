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

  /* Microsoft Forms. Per form:
     url          share link (Collect responses > Copy link). Leave "" to show "not set up yet".
     nameParam    question ID of the patient-name question, to pre-fill it (from Forms
                  "Get pre-filled link": the part before "=" for that question). Or put
                  PATIENTNAME inside url instead. "" = patient types their own name.
     priceParam   question ID to pre-fill a price; pricePrompt is the label staff see.
                  Staff must enter the price when that form is checked.
     desc         short note for staff on who gets this form. */
  namePlaceholder: "PATIENTNAME",
  forms: [
    { id: "wellness", title: "Wellness & Supervised Module Intake", desc: "Wellness / supervised module patients",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UMU9QNFlYTUNXRlU2MkhRUUNDWU85V0gzRy4u", nameParam: "", priceParam: "reeddc4ec437a454d949efef67b4f56e7", pricePrompt: "Cost per visit", checkedByDefault: false },
    { id: "pelvic", title: "Pelvic Floor Exam Consent", desc: "Internal pelvic floor exam",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UOTg3UUxaOENaVkdLWVkySFRMNTVJUTFaSS4u", nameParam: "", checkedByDefault: false },
    { id: "selfpay", title: "Self-Pay Form", desc: "Self-pay / cash-pay patients",
      minutes: 3, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UMlBKOFZIWUlZT0tDRVVaODNTOTMxN0xINS4u", nameParam: "", checkedByDefault: false },
    { id: "dryneedling", title: "Dry Needling Consent", desc: "Patients receiving dry needling",
      minutes: 3, url: "", nameParam: "", checkedByDefault: false },
    { id: "credentialing", title: "Temporary Credentialing Disclosure", desc: "Patients billed under provisional credentialing",
      minutes: 3, url: "", nameParam: "", priceParam: "", pricePrompt: "Temporary collected fee", checkedByDefault: false }
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
    patientQuestionSec: 60,    // no touch for 60 s on a patient screen -> "Are you still there?"
    patientLockSec: 120,       // still no touch at 120 s -> tablet pauses; staff unlock with PIN to continue
    formQuestionSec: 300,      // on a Microsoft Form page (touches inside the form can't be detected), ask after 5 min;
                               // it then pauses 60 s later, like other patient screens
    staffResetSec: 120,        // staff screens left alone -> back to welcome (or back to the pause screen)
    lockAutoResetMin: 30,      // a paused tablet nobody unlocks is wiped after 30 min
    doneAutoResetSec: 90,      // done screen returns to welcome
    iframeLoadSec: 20          // show "trouble loading" help after this
  }
};
