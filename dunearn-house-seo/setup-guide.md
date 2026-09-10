# 🚀 How to Get Dunearn House Live on Hostinger

## Quick Steps (5-10 min)

### 1. Login to Hostinger
- Go to https://hpanel.hostinger.com
- Login with your Hostinger credentials
- You'll see **jetleechannel.sg** in your dashboard

### 2. Create a Subdomain
- In hPanel, find **Domains** → **Subdomains**
- Create: `dunernhouse.jetleechannel.sg`
- It will ask for a document root. Use: `/dunernhouse` (or just `/public_html/dunernhouse`)
- This auto-creates the folder

### 3. Upload the HTML file
- In hPanel, go to **File Manager**
- Navigate to the folder you picked (e.g., `/dunernhouse` or `/public_html/dunernhouse`)
- Click **Upload** → select the file
- Make sure the file is named **`index.html`** (must be exact)

### 4. Upload images folder
- Upload the `images/` folder alongside `index.html`
- The folder structure should be:
  ```
  dunernhouse/
    index.html
    images/
      hero-bg.jpg
      map-preview.jpg
      ...
  ```

### 5. Test it
- Visit: https://dunernhouse.jetleechannel.sg
- It should show your site!

### 6. Submit to Google (next day)
- Go to https://search.google.com/search-console
- Add your property: `dunernhouse.jetleechannel.sg`
- Verify ownership (DNS TXT record or HTML file)
- Submit sitemap (I'll help you create one)

---

## Troubleshooting

❌ **"Site not found"** — Wait 5-30 min for DNS to propagate
❌ **"403 Forbidden"** — Check file permissions are 644
❌ **Images not showing** — Make sure image paths start with `images/` not `/images/`

Need help? Screenshot and send to me!
