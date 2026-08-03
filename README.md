# Pairbeam — control your laptop from your phone

A small web app: open it on your laptop and your phone, pair them with a
short code, and send remote-control commands over a direct peer-to-peer
connection (WebRTC via [PeerJS](https://peerjs.com), using their free
public signaling server — no backend of your own required).

## What works out of the box (pure HTML/CSS/JS)

- **Pairing**: laptop shows a code, phone types it in, they connect directly.
- **Zoom in / out**: zooms the web page itself.
- **Scroll up / down**: scrolls the page.

## What needs the optional local helper

Browsers deliberately can't reach outside their own tab — a web page has
no way to lock your OS, Alt-Tab between apps, or hit media keys, on any
platform. That's not a bug in this project, it's a browser security
boundary. To do those, `index.html` forwards those specific commands to
a tiny local Node.js server (`helper/server.js`) that runs on your
laptop and executes the actual OS command:

- **Lock laptop**
- **Switch app** (Alt+Tab / Cmd+Tab equivalent)
- **Play / pause** media

### Running the helper

```bash
cd helper
npm install    # no dependencies today, but future-proofs it
npm start
```

Leave that terminal window open while you use Pairbeam. If it's not
running, those three buttons will just log "needs the local helper" —
everything else still works fine.

## Hosting on GitHub Pages

1. Push `index.html` to a repo (root, or a `/docs` folder).
2. Repo Settings → Pages → set source to that branch/folder.
3. Open the published URL on both your laptop and your phone.

### One thing to know about HTTPS + localhost

GitHub Pages serves your site over HTTPS. Some browsers restrict a
secure page from calling out to `http://localhost`. If the helper
buttons don't respond even with the helper running:

- Try it first over plain HTTP by serving `index.html` locally on the
  laptop (e.g. `npx serve` or Python's `http.server`) instead of the
  GitHub Pages URL, **or**
- Check your browser's console for a blocked mixed-content / private
  network access warning — Chrome and Edge show this clearly.

This only affects the three "helper" commands; pairing, zoom, and
scroll work identically either way since they never leave the page.

## Security note

The helper only listens on `127.0.0.1` (not your network), so nothing
outside your own machine can reach it. It's meant for your own
devices — don't expose port 5678 to the internet or your local network.
