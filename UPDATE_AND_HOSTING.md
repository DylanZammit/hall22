# Daily updates and publishing

## Recommended setup

Keep the site static and run `npm run update` once per evening. The updater:

1. reads MaltaToday’s Court & Police page;
2. finds the newest Yorgen Fenech trial article;
3. sends only that MaltaToday article to OpenAI;
4. updates `data/latest.js`, including the lead summary and relationship changes.

The model output is constrained to a JSON schema. Still review each update: this is reporting about an active criminal trial, and automation must not turn testimony into fact.

## Configure the updater

Create an OpenAI API key and make it available only to the update process. Never put it in `index.html`, `app.js`, Git, or a public web directory.

```sh
export OPENAI_API_KEY="your-key"
npm run update
npm run check
```

The default model is `gpt-5.6-sol`. Override it with `OPENAI_MODEL` if required.

## Run every day at 20:00 in Malta

On macOS, use `launchd`; it handles sleeping laptops more reliably than cron. Copy the example below to `~/Library/LaunchAgents/mt.hall22.update.plist`, replacing `YOUR_USER`, the API-key retrieval command, and paths.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>mt.hall22.update</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd /Users/YOUR_USER/Documents/GitHub/test &amp;&amp; export OPENAI_API_KEY="$(security find-generic-password -a YOUR_USER -s hall22-openai -w)" &amp;&amp; npm run update &amp;&amp; npm run check</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>20</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>/tmp/hall22-update.log</string>
  <key>StandardErrorPath</key><string>/tmp/hall22-update-error.log</string>
</dict>
</plist>
```

Store the key in macOS Keychain:

```sh
security add-generic-password -a "$USER" -s hall22-openai -w
launchctl load ~/Library/LaunchAgents/mt.hall22.update.plist
```

The laptop must be powered on, awake or able to wake, and online. If reliability matters, GitHub Actions or a small cloud scheduled job is preferable.

## Hosting options

### Best option: static hosting

Push this folder to GitHub and publish it with Cloudflare Pages, GitHub Pages, Netlify, or Vercel. Point a custom domain’s DNS to that provider. This is more reliable and secure than exposing a laptop, includes HTTPS, and can redeploy after each daily commit.

A useful workflow is:

1. scheduler runs the updater at 20:00;
2. review `data/latest.js`;
3. commit and push;
4. the static host deploys automatically.

### Hosting from the laptop

Run the site on a non-privileged local port:

```sh
npm start
```

Then use a Cloudflare Tunnel to expose `http://localhost:4173` and map a custom hostname to it. Do not open port 4173 directly on the router. A tunnel supplies HTTPS and avoids exposing the laptop’s public IP, but the website goes offline whenever the laptop sleeps, disconnects, or restarts.

For a long-running laptop server, run both the web server and tunnel as macOS services, disable sleep while plugged in, keep the OS patched, and serve only this project directory.
