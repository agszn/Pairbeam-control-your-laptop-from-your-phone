/**
 * Pairbeam local helper
 * ---------------------
 * Browsers can't lock your screen or switch apps — this tiny local
 * server does that part. It only listens on localhost, only accepts
 * requests from the Pairbeam page running in your own browser, and
 * only runs while you keep this terminal window open.
 *
 * Setup:
 *   cd helper
 *   npm install
 *   npm start
 *
 * Then open index.html (as the laptop/host) in your browser as usual.
 * "Lock laptop", "Switch app" and "Play / pause" will now work.
 */
const http = require('http');
const { exec } = require('child_process');
const os = require('os');

const PORT = 5678;
const platform = os.platform(); // 'win32' | 'darwin' | 'linux'

function run(cmd, label) {
  exec(cmd, (err) => {
    if (err) console.error(`[${label}] failed:`, err.message);
    else console.log(`[${label}] ok`);
  });
}

function lockScreen() {
  if (platform === 'win32') {
    run('rundll32.exe user32.dll,LockWorkStation', 'lock');
  } else if (platform === 'darwin') {
    // Locks the screen immediately on macOS
    run('pmset displaysleepnow', 'lock');
  } else {
    // Most Linux desktops ship one of these
    run('loginctl lock-session || xdg-screensaver lock || gnome-screensaver-command -l', 'lock');
  }
}

function switchApp() {
  if (platform === 'win32') {
    // Sends Alt+Tab via a short PowerShell keypress simulation
    const ps = `powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('%{TAB}')"`;
    run(ps, 'switch-app');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to key code 48 using command down'`, 'switch-app');
  } else {
    run(`wmctrl -s next || xdotool key alt+Tab`, 'switch-app');
  }
}

function playPause() {
  if (platform === 'win32') {
    const ps = `powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]179)"`;
    run(ps, 'play-pause');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to key code 16 using {}'`, 'play-pause');
  } else {
    run(`playerctl play-pause`, 'play-pause');
  }
}

const routes = {
  '/lock': lockScreen,
  '/switch-app': switchApp,
  '/play-pause': playPause,
};

const server = http.createServer((req, res) => {
  // CORS: only needed because the page is served from file:// or a
  // github.io origin, not from localhost itself.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const handler = routes[req.url];
  if (req.method === 'POST' && handler) {
    handler();
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Pairbeam helper running on http://localhost:${PORT} (platform: ${platform})`);
  console.log('Keep this window open. Press Ctrl+C to stop.');
});
