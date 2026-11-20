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
     Consent to Treat, Financial Responsibility and HIPAA were removed from the tablet on
     Nov 19, 2026: patients sign those inside WebPT Reach intake instead.
     Every form has "pre-filled answers" turned on, so nameParam/dobParam/priceParam work.
     Per form:
     url          share link (Collect responses > Copy link). Leave "" to show "not set up yet".
     nameParam    question ID of the patient-name question, to pre-fill it (from Forms
                  "Get pre-filled link": the part before "=" for that question). Or put
                  PATIENTNAME inside url instead. "" = patient types their own name.
     dobParam     question ID of the date-of-birth question. Staff enter DOB once on the setup
                  screen and it is sent to every form (as YYYY-MM-DD, which Forms accepts).
     priceParam   question ID to pre-fill a price; pricePrompt is the label staff see.
                  Staff must enter the price when that form is checked.
     desc         short note for staff on who gets this form. */
  namePlaceholder: "PATIENTNAME",
  forms: [
    { id: "pelvic", title: "Pelvic Floor Exam Consent", desc: "Internal pelvic floor exam",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UNElWOVBFMkdVVzhHRlRQNFY5MkNEQlVDOS4u",
      nameParam: "r8ed16a9029bd49ce8c2da4417543fef3", dobParam: "rc47c17d677a642279a8f4624b6970d14", checkedByDefault: false },
    { id: "dryneedling", title: "Dry Needling Consent", desc: "Patients receiving dry needling",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UN1JKMlVaRTZFWlhSVFU1NFhIVVNYR0NOWi4u",
      nameParam: "rb6d1ab9009fe428d838942a93f32627c", dobParam: "r0806e2de57e245dd9640a626f61ab9bf", checkedByDefault: false },
    { id: "selfpay", title: "Self-Pay Form", desc: "Self-pay / cash-pay patients",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UNkpFQTkzNzBZQVZNUEdXRVM1QVUwVkZMRi4u",
      nameParam: "rb33eb31fb64b41bf9fa0c86249367205", dobParam: "rbe5c86345934479cbb3203532be25ece", checkedByDefault: false },
    { id: "credentialing", title: "Temporary Credentialing Disclosure", desc: "Patients billed under provisional credentialing",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UOVNCWFEzSE82UUEzNDFWVkFINjk0R0REWC4u",
      nameParam: "r4e77b0cca2e849bfaed1fd85efdb9c70", dobParam: "r07062844d4e24c09b1ed6f1fccb4700e",
      priceParam: "r786866b4099240318bfa7d001b0bfffb", pricePrompt: "Temporary collected fee", checkedByDefault: false },
    { id: "wellness", title: "Wellness Program Intake", desc: "Wellness program patients",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UOVhaTjgxSko5SFMxMkhJMkVCUDdLQVNHVy4u",
      nameParam: "rdef9c886399a44c09ea6b4078fe608f2", dobParam: "rf2646f684ed04de2ad1587f7708791cc",
      priceParam: "rfa4a7133c281406db346d011cf242eac", pricePrompt: "Cost per visit", checkedByDefault: false },
    /* Outcome questionnaires (added Nov 20, 2026). Scores are calculated by the Intake PDF flows. */
    { id: "dhi", title: "Dizziness Handicap Inventory (DHI)", desc: "Dizziness / balance patients",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5URVFGV1hOQ1NKSzRFOEcwVUNTUUVMSEg4RC4u",
      nameParam: "r175244b7476241d595f2444a3360a344", dobParam: "re69863745c614210868accbf8fffee94", checkedByDefault: false },
    { id: "lefs", title: "Lower Extremity Functional Scale (LEFS)", desc: "Hip, knee, ankle or foot problems",
      minutes: 4, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UNExNSzhQOVg1NEQwRElTM0pOSE44MzFVMy4u",
      nameParam: "ra8fe6aeb29294a2ab9141319bf991be0", dobParam: "rddd527443fe64276bf510aae9f506955", checkedByDefault: false },
    { id: "cpsi", title: "NIH-CPSI (Chronic Prostatitis Symptom Index)", desc: "Male pelvic pain / prostatitis symptoms",
      minutes: 3, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UMEM4MkZVOVkySkM4QTVaM0VLWTMxNzdRRy4u",
      nameParam: "rbe363f09c24e4e5eaee8715873adee5e", dobParam: "rf35615e5aa5a45069e94a3962cc818fe", checkedByDefault: false },
    { id: "pfdi", title: "Pelvic Floor Disability Index (PFDI-20)", desc: "Bladder, bowel or prolapse symptoms",
      minutes: 5, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5UM0VHMUZCRUcySDNNTlhEQ0JNU0JWSUJBSi4u",
      nameParam: "r7f01c7afc7d54b58b309db0bff5078fc", dobParam: "re647062271d340ef850712c547f9d296", checkedByDefault: false },
    { id: "quickdash", title: "QuickDASH", desc: "Arm, shoulder or hand problems",
      minutes: 3, url: "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=K_j3YfnYNkuP-lOlrjcwegvi4db-qHVOrSDQtYnWAY5URjNMNEo1Vlc4MEdBMkcxMENGWFRHODRLNy4u",
      nameParam: "r96fcc20a89d1450488be54dc97ef4cf7", dobParam: "r2d6b30668d414261bc251cb6546a0a40", checkedByDefault: false }
  ],

  /* WebPT Reach kiosk-mode intake (QR/URL from the patient's Reach chart).
     It appears as the first item in the staff form list. If checked, staff scan the
     WebPT QR code right after setup. position: "first" (default) or "last" in the
     patient's steps.
     mode: "frame" (default since v9) shows WebPT inside this page, with the kiosk's own
           "I've finished — continue" button always on screen, so the patient never has to
           find a browser X or back arrow. A "Form not showing?" link falls back to "tab".
           "tab" opens WebPT on top of this page (the v8 behaviour).
     allowedHosts: domains a scanned link may point to, so random QR codes are rejected.
     Empty list = accept any https link. */
  webpt: { enabled: true, position: "first", mode: "frame", allowedHosts: ["webpt.com"] },

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
