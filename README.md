# AXIS PT Intake Tablet: Kiosk Start Page

A static page (HTML, CSS and JS, with no server and no database). It runs on the intake tablet (Samsung Galaxy Tab A11+) as an **installed Chrome web app, locked in with Android app pinning**. There is no third-party kiosk app, so no extra vendor has access to what patients type.
It is hosted on GitHub Pages: `AxisPTIT/axis-intake-kiosk` → https://axisptit.github.io/axis-intake-kiosk/

| File | What it is |
|---|---|
| `index.html` | All screens |
| `styles.css` | AXIS branding (gold `#C9A84C`, cream, Cormorant Garamond + Jost), touch sizing |
| `app.js` | Flow logic, staff PIN, timeouts, QR scan |
| `config.js` | **The file you edit**: PIN hash, form links, WebPT settings, timeouts |
| `manifest.webmanifest`, `icon-*.png` | Let Chrome install the page as a full-screen app |

## How it works

1. **Welcome screen:** "Welcome. Please check in at the front desk." A large **🔒 Staff login** button sits bottom-right.
2. **Staff PIN**, then **Setup**: enter the patient's first and last name, then tick the forms for this visit. **WebPT patient intake** is the first item in the same list. Forms with a price (Wellness) ask for it when ticked.
3. **If WebPT is ticked**, the button reads **Continue → scan WebPT code**. The camera opens: hold the tablet up to the QR code from Reach (patient chart → Send Intake → Complete Intake → Kiosk mode). Once it's read, tap **Hand to patient →**. If the camera won't work, "Can't scan? Type the link" is a fallback. **If WebPT isn't ticked**, the button reads **Ready — hand to patient** and goes straight to the patient.
   The patient sees "Hi Brad! You have 3 forms…" and confirms *"Yes, I'm Brad M."* ("That's not me" sends them back to the desk.)
4. **Steps run in order.** By default the WebPT intake is first, then each consent form (set `webpt.position` in `config.js`):
   - **WebPT:** "Open my intake form" opens WebPT **on top of** the kiosk page. When the patient finishes, they tap ✕ or ← (or swipe back) to return. Then they tap **I've finished. Continue →**. Two more buttons: *Open my intake form again* and *I couldn't finish it*. If Chrome opens WebPT in the same tab instead, the page remembers where the patient was and comes back to that same screen.
   - **Consent forms:** each form is embedded with the patient's name (and, for Wellness and Credentialing, the staff-entered price) pre-filled. Forms have several pages with their own **Next** buttons and a **Submit** at the end. The kiosk's own buttons are **Skip this form** (asks to confirm) and **Done with this form →** (one tap, no pop-up). The top bar has an **Enlarge text** button; it enlarges the kiosk's own text, not the Microsoft Form itself.
5. **Done screen:** "Thank you for completing the consent forms. Please return the tablet to Axis PT staff." It auto-resets after 90 s.
6. **Staff login → PIN → Session summary** shows each step as Done, Done tapped, Skipped, In progress, Not finished or Not reached. Tap **Clear & reset**.

Inactivity: on patient screens (including form pages), no touch for **200 s** shows "Are you still there?"; no answer within **120 s** after that pauses the tablet ("Paused for privacy, return to the front desk"). Staff log in and choose **Unlock & continue** (back to the same spot) or **Clear & reset**. Touches inside a Microsoft Form can't be detected, so a patient typing in a long form may see the question; tapping "I'm still here" carries on. A paused tablet nobody unlocks is wiped after 30 min. All of these are in `config.js` → `timeouts`.

Privacy: the patient's name and progress live in page memory. During the WebPT step only, a copy is kept in that tab's sessionStorage so the patient can resume. Reset wipes it and reloads the page. Nothing goes to GitHub. While WebPT is open on top, the kiosk page's inactivity timer is paused, so it can't reset mid-intake. After that: "Are you still there?", then a reset.

## One-time setup

### 1. Microsoft Forms (done Nov 18, 2026)
All 8 forms were rebuilt from the Nov 18 print PDFs and are already set up: **Anyone can respond** (no sign-in inside the frame), pre-filled answers **on**, progress bar **on**, "Submit another response" **hidden**, "save my response" and receipts **off**, and a thank-you message that tells the patient to tap **Done with this form**. Question IDs for pre-fill are already in `config.js`.
If you add a new form: turn on **⋯ → Get Pre-filled URL → Enable pre-filled answers**, copy the patient-name question ID (the `r…` key in the pre-filled link) into `nameParam`, and open the form once in the Forms editor before testing. Forms built outside the editor showed **Submit** on page 1 until they had been opened there once.
- **Before going live, verify** that your Microsoft 365 plan's BAA/HIPAA coverage includes Microsoft Forms responses. This is not confirmed from any of your documents.

### 2. Edit `config.js`
- `staffPinSha256`: already set to the existing staff PIN. To change it, generate a new hash (instructions are in the file).
- `forms[]`: all 8 forms have live links and pre-fill IDs. Consent, Financial Responsibility and HIPAA are ticked by default; staff untick them for returning patients. Add or remove forms by copying an entry (`id` must be unique).
- `webpt.allowedHosts`: set to `webpt.com` (any subdomain is accepted). If a real scanned link is rejected, add its domain.
- `logo`: currently loads from axisptutah.com. Better: download `https://axisptutah.com/images/logo-nav.png` into the repo as `assets/logo.png` and point to it, so the kiosk doesn't depend on the website.

### 3. Deploy
Upload all files to the repo root (GitHub web → **Add file → Upload files**, or `git push`). This **replaces the current `index.html`**. Pages updates in about a minute. Test the URL on a laptop first.

### 4. Lock the tablet: Chrome app + app pinning (no kiosk app)
Menu names below are typical for Samsung One UI. They may differ slightly on your tablet.

**Install the page as an app**
1. In Chrome, open `https://axisptit.github.io/axis-intake-kiosk/`.
2. Tap **⋮ → Add to Home screen → Install**. You want "Install", not a plain shortcut; "AXIS Forms" then appears in the app drawer.
3. Open **AXIS Forms** from the home screen. It should run full screen with no address bar. If you still see an address bar, it was added as a shortcut: remove it and install again.
4. Allow the camera when asked (only used to scan the WebPT QR code).

**Turn on app pinning**
1. **Settings → Security and privacy → More security settings → Pin app → On**. Turn on **Ask for PIN before unpinning**.
2. Open AXIS Forms → **Recent apps** button → tap the AXIS Forms icon at the top of its card → **Pin this app**.
3. To unpin: hold **Back + Recent apps**, then enter the device PIN. Staff only.

**Tablet hygiene**
- Use a strong device PIN, different from the page's staff PIN.
- Don't add a personal Google account. Remove unused apps and install updates.
- Display → Screen timeout: 10 min. Keep the tablet on its charger.
- Network: patient/guest or IoT VLAN, not the staff LAN.
- After a reboot, staff reopen AXIS Forms and pin it again.
- **Weekly:** Chrome → Settings → Privacy → **Delete browsing data** (cookies and cache). This clears leftover WebPT or Microsoft sessions; nothing does it automatically now.
- **⚠ Unsubmitted Microsoft Forms drafts (privacy).** Microsoft Forms keeps a patient's *unsubmitted* answers in the browser and offers them to the next person who opens that form ("Use previous draft"), or reloads them silently. Submitting clears the draft; **skipping a form, walking away, or a kiosk reset does not.** The kiosk cannot clear Microsoft's storage. Until this is solved: if the summary shows a form as **Skipped**, **Done tapped** without a submission, or **Not finished**, clear Chrome site data for `forms.cloud.microsoft` before the next patient (Chrome → Settings → Privacy and security → Site settings → View permissions and data stored across sites → search "forms" → Delete). Test on the tablet whether blocking site data for `[*.]forms.cloud.microsoft` (Site settings → On-device site data → "Not allowed to save data") stops drafts without breaking the forms; if it does, that is the permanent fix.

**What to test on the tablet (I couldn't test these off-device)**
- Does WebPT open on top of the pinned app (a Chrome tab with ✕), and does ✕ or back return to the Continue screen? If pinning blocks the new tab, the page falls back to opening WebPT in the same tab; then **back** returns to the Continue screen.
- While pinned, can a patient reach anything else? Try home, recents, the notification shade and long-press.
- Does the WebPT QR scan work? If the camera button says it isn't supported, paste the link instead.

### Known limits (by design, not bugs)
- The page **cannot see** whether a patient pressed Submit inside a Microsoft Form, or finished WebPT (the browser blocks cross-site access). The confirm prompts, the staff summary, the SharePoint PDFs and the Reach intake dashboard are the safety net.
- Touches **inside** a form can't be detected, so the idle timeout during a form or the WebPT step is long (20 min).
- QR scanning uses Chrome's BarcodeDetector. If it isn't available, the page says so and staff paste the link.
- The staff PIN is a speed bump only, because the code is public. App pinning with a device PIN is the actual lock.
- Without a kiosk app there is no automatic restart after a reboot and no automatic clearing of browser data. Both are covered by the staff steps above.

## Usability test plan (run before go-live)
**Who:** 5 to 6 people: at least 1 aged 65+, 1 with low vision or who uses reading glasses, 1 who isn't comfortable with tech, and 1 Spanish-dominant speaker (if that is common at the clinic). Staff family members are fine for round 1.

**Tasks (observe and don't help):**
1. Staff: set up "Test Patient" with one consent form plus WebPT, in under 60 s.
2. Patient: complete the form and submit.
3. Patient: skip a form.
4. Patient: open WebPT, come back, and continue without staff help.
5. Patient: walk away mid-form, then confirm the screen resets and no name is visible.
6. Staff: read the summary and reset.

**Record:** time per task, every hesitation or wrong tap, whether they found Submit, whether they tapped Next *before* submitting, and their 1–5 ease rating.
**Pass bar:** 5 of 6 finish without help; nobody taps Next without submitting.
**Then:** fix the top 3 issues, retest with 3 new people.
