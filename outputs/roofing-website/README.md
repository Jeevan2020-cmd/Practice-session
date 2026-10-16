# Birmingham Roof Quotes: website

A fast lead-generation website for roofing jobs in Birmingham and Sutton Coldfield. Homeowners fill in a short quote form. Each lead is scored, logged in your Google Sheet and emailed to you, ready to forward to the roofer.

**Built with:** [Astro](https://astro.build), which turns the templates and Markdown files here into plain HTML pages. Plain HTML pages load fast, and Google uses speed as a ranking factor.

---

## What's in this folder

| Path | What it is |
| --- | --- |
| `src/config.ts` | **Start here.** Brand name, domain, phone number, form connection. Change it once and every page updates. |
| `src/content/services/` | The 4 service pages, one Markdown file each |
| `src/content/areas/` | Area pages (Sutton Coldfield, Four Oaks) |
| `src/content/guides/` | The 8 cost and advice guides, which are the main AEO pages |
| `src/pages/` | Home, quote form, how it works, about, privacy, terms |
| `src/components/QuoteForm.astro` | The 4-step quote form |
| `apps-script/Code.gs` | The Google script that receives leads |
| `public/robots.txt` | Tells search engines and AI crawlers they're welcome |

Every content page has a **quick answer** at the top, an **FAQ** section and **sources**. These help with AEO (answer engine optimisation), because AI tools like ChatGPT and Google's AI Overviews tend to quote short, direct, well-sourced answers. Structured data (JSON-LD) is added automatically.

---

## Setup: step by step

Work through these steps in order. Steps 1 to 3 get you live; 4 to 6 get you found.

### Step 1: Buy the domain

The site is built for **birminghamroofquotes.co.uk**. I couldn't check whether it's available, so search for it at a registrar such as Cloudflare, Namecheap or 123 Reg. A `.co.uk` usually costs around £5 to £15 a year.

Backups if it's taken: `birminghamroofquotes.com`, `brumroofquotes.co.uk`, `suttonroofquotes.co.uk`.

If you end up with a different domain, update it in three places:
1. `src/config.ts`, the `url` line
2. `public/robots.txt`, the `Sitemap:` line
3. `apps-script/Code.gs`, the `SITE_URL` line

### Step 2: Connect the form to a Google Sheet (about 10 minutes)

This is what makes the form work. Until it's done, the form shows a "please call us" message instead.

1. Go to [sheets.google.com](https://sheets.google.com) and create a blank spreadsheet. Call it **Roofing leads**.
2. In the sheet, click **Extensions → Apps Script**.
3. Delete the sample code, then copy everything from `apps-script/Code.gs` and paste it in.
4. In the `SETTINGS` block at the top, replace `PASTE_YOUR_EMAIL_HERE` with the email address where you want leads sent. Click the **save** icon.
5. Choose **testLead** from the function dropdown at the top and click **Run**. Google will ask for permission. Click through the "unverified app" warning (**Advanced → Go to project**): it's your own script. You should get a test email, and a **Leads** tab should appear in your sheet.
6. Click **Deploy → New deployment**. Click the cog, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
8. Paste that URL into `src/config.ts` as `leadEndpoint: '...'`, or send it to Claude to do for you.

> **If you change the script later:** use **Deploy → Manage deployments → Edit → New version**. That keeps the same URL. Creating a *new* deployment gives you a new URL, and the form would stop working until you update it.

**Why the email isn't in this repo:** this GitHub repo is public, so anything in it can be read by anyone, including spam bots. Your email only lives inside your private Google script.

### Step 3: Put the site online with Cloudflare Pages (free)

1. Create a free account at [cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Go to **Workers & Pages → Create → Pages → Connect to Git** and choose the **Practice-session** repository.
3. Use these build settings:
   - **Production branch:** `main`
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `outputs/roofing-website`
   - **Environment variable:** `NODE_VERSION` = `22`
4. Click **Save and Deploy**. After a minute or two you'll get a free `.pages.dev` address you can visit.
5. Go to **Custom domains** and add your domain. If you bought it through Cloudflare, it's a couple of clicks.

> **Important for AEO:** Cloudflare can block AI crawlers by default on new sites. In your domain's dashboard, look for the **AI Crawl Control** or **Bots** settings and make sure AI *search* crawlers are **allowed**. Otherwise ChatGPT, Perplexity and others can't read your pages to quote them.

Every time new changes are pushed to `main`, Cloudflare rebuilds the site automatically.

### Step 4: Tell Google and Bing the site exists

1. **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)): add your domain, verify it (Cloudflare makes this easy), then go to **Sitemaps** and submit `sitemap-index.xml`.
2. **Bing Webmaster Tools** ([bing.com/webmasters](https://www.bing.com/webmasters)): you can import your site straight from Search Console. Several AI assistants use Bing's index, so this matters for AEO.

Expect a few weeks before pages appear, and 3 to 6 months before you rank well for competitive terms like "roofer Birmingham". The cost guides usually start bringing visitors in first.

### Step 5: Turn on visitor stats

In Cloudflare, open your Pages project, go to **Metrics**, and enable **Web Analytics**. It's free and doesn't use cookies, so you don't need a cookie banner.

### Step 6: Before you launch: business checklist

- [ ] **The roofer.** Agree the fee per lead (or per job won), how fast they'll call customers, and how disputes are handled. Put it in writing.
- [ ] **The checks.** The "How it works" page says you check that roofers have public liability insurance, give written quotes, offer a written guarantee, don't take big upfront payments and have genuine reviews. **Actually make those checks**, and keep a copy of their insurance certificate.
- [ ] **Data protection.** Because you're handling customers' personal details for a business, you'll likely need to pay the ICO data protection fee. It was £52 a year for small businesses as of 2025 (£47 by Direct Debit). Check the current amount at [ico.org.uk/fee](https://ico.org.uk/for-organisations/data-protection-fee/).
- [ ] **Your name.** Add your name or company name to `operatorName` in `src/config.ts`. It appears on the privacy and terms pages.
- [ ] **A business email.** Once you own the domain, set up something like `hello@yourdomain` and add it as `contactEmail` in `src/config.ts`.
- [ ] **Test it.** Submit the live form yourself and check the email arrives and the sheet updates.

---

## Day-to-day: handling leads

1. A lead arrives in your inbox, with the subject starting **[HOT]**, **[WARM]** or **[COOL]**.
2. Forward it to the roofer. Emergencies first.
3. In the Google Sheet, update **Status** and **Sent to roofer**. This is your record for billing.
4. Leads marked **"NO - check"** under **In area** are outside Birmingham and Sutton Coldfield. Decide whether the roofer covers them.

**How the score works (out of 10):** job value (new roof 3; repair, flat roof or chimney 2; guttering 1) + urgency (emergency or within 2 weeks 3; 1 to 3 months 2; just browsing 0) + ownership (owner, landlord or business 2; tenant 0) + in area (2). 8 or more is HOT, 6 to 7 is WARM. Change the numbers in `scoreLead` in `Code.gs` to suit your roofer.

**Spam protection:** a hidden "honeypot" field that only bots fill in, a check that rejects forms completed in under 4 seconds, and rejection of links in the name or phone fields.

---

## Editing content

- **Change a price or sentence:** edit the Markdown file in `src/content/`. The section between the `---` lines at the top holds the title, description, quick answer, FAQs and sources.
- **Add a guide:** copy an existing file in `src/content/guides/`, rename it with lowercase and hyphens (for example `roof-moss-removal-cost.md`), and edit it. It's added to the guides page, sitemap and `llms.txt` automatically.
- **Keep it fresh:** review prices every 6 to 12 months and update the `updated:` date and `lastReviewed` in `config.ts`. AI tools and Google both favour content that's clearly dated and current.

## Running it on your own computer (optional)

You need [Node.js](https://nodejs.org) 22 or newer.

```bash
cd outputs/roofing-website
npm install
npm run dev     # opens a live preview at http://localhost:4321
npm run build   # builds the final site into dist/
```
