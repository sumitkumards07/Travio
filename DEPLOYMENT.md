# Deployment Guide for Travio

## 1. Build the Project
First, create a production build of your website:
```bash
npm run build
```
This will create a `dist` folder with your static website files.

## 2. Deploy to Vercel (Recommended)
Vercel is the easiest way to deploy Vite/React apps.

1.  **Install Vercel CLI** (if not installed):
    ```bash
    npm i -g vercel
    ```

2.  **Deploy**:
    Run the following command in your terminal:
    ```bash
    vercel
    ```
    - Follow the prompts (Select 'Yes' to set up and deploy).
    - It will automatically detect the Vite settings.

3.  **Connect Domain (travio.live)**:
    - Go to your Vercel Dashboard.
    - Select your new project.
    - Go to **Settings** > **Domains**.
    - Enter `travio.live` and click **Add**.
    - Vercel will give you DNS records (A Record and CNAME) to add to your domain registrar (where you bought the domain).

## 3. Alternative: Netlify
1.  Drag and drop the `dist` folder to Netlify Drop.
2.  Go to **Domain Settings** > **Add custom domain**.
3.  Enter `travio.live` and follow the DNS verification steps.

## Connect to Domain (DNS Settings)
Log in to your domain provider (e.g., GoDaddy, Namecheap) and update your DNS records to point to your deployment provider (Vercel/Netlify).

**Example for Vercel:**
- **Type**: A
- **Name**: @
- **Value**: 76.76.21.21

- **Type**: CNAME
- **Name**: www
- **Value**: cname.vercel-dns.com

### GoDaddy Specific Instructions
1. Log in to your GoDaddy **Domain Control Center**.
2. Select your domain **travio.live** to access the **Domain Settings** page.
3. Scroll down to **Additional Settings** and select **Manage DNS**.
4. On the DNS Management page, select **Add**.
5. Add the **A Record** (for the root domain):
   - **Type**: A
   - **Name**: @
   - **Value**: `76.76.21.21`
   - **TTL**: Default (1 Hour)
6. **Edit existing CNAME Record** (if `www` already exists) OR **Add New**:
   - Locate the row where **Name** is `www`.
   - Click the pencil icon to **Edit**.
   - Change **Value** (or Points to) to: `cname.vercel-dns.com`
   - **TTL**: Default (1 Hour)
7. Save your changes. It may take up to 48 hours to propagate, but usually happens within minutes.
