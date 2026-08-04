/**
 * Pairbeam local helper
 * ---------------------
 * Browsers can't reach outside their own tab — this tiny local
 * server does that part. It simulates a real keystroke to whatever
 * app currently has focus (like a physical keyboard would), so
 * zoom/scroll/lock/switch-app work system-wide, not just on the
 * Pairbeam page. It only listens on localhost and only runs while
 * you keep this terminal window open.
 *
 * Setup:
 *   cd helper
 *   npm install
 *   npm start
 *
 * Linux only: requires xdotool (sudo apt install xdotool).
 *
 * Then open index.html (as the laptop/host) in your browser as usual.
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
    run('pmset displaysleepnow', 'lock');
  } else {
    run('loginctl lock-session || xdg-screensaver lock || gnome-screensaver-command -l', 'lock');
  }
}

function switchApp() {
  if (platform === 'win32') {
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

function zoomIn() {
  if (platform === 'win32') {
    run(`powershell -command "$w = New-Object -ComObject wscript.shell; $w.SendKeys('^{ADD}')"`, 'zoom-in');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to keystroke "+" using command down'`, 'zoom-in');
  } else {
    run(`xdotool key ctrl+plus`, 'zoom-in');
  }
}

function zoomOut() {
  if (platform === 'win32') {
    run(`powershell -command "$w = New-Object -ComObject wscript.shell; $w.SendKeys('^{SUBTRACT}')"`, 'zoom-out');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to keystroke "-" using command down'`, 'zoom-out');
  } else {
    run(`xdotool key ctrl+minus`, 'zoom-out');
  }
}

function scrollUp() {
  if (platform === 'win32') {
    run(`powershell -command "$w = New-Object -ComObject wscript.shell; $w.SendKeys('{PGUP}')"`, 'scroll-up');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to key code 116'`, 'scroll-up');
  } else {
    run(`xdotool key Page_Up`, 'scroll-up');
  }
}

function scrollDown() {
  if (platform === 'win32') {
    run(`powershell -command "$w = New-Object -ComObject wscript.shell; $w.SendKeys('{PGDN}')"`, 'scroll-down');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to key code 121'`, 'scroll-down');
  } else {
    run(`xdotool key Page_Down`, 'scroll-down');
  }
}

function moveLeft() {
  if (platform === 'win32') {
    run(`powershell -command "$w = New-Object -ComObject wscript.shell; $w.SendKeys('{LEFT}')"`, 'move-left');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to key code 123'`, 'move-left');
  } else {
    run(`xdotool key Left`, 'move-left');
  }
}

function moveRight() {
  if (platform === 'win32') {
    run(`powershell -command "$w = New-Object -ComObject wscript.shell; $w.SendKeys('{RIGHT}')"`, 'move-right');
  } else if (platform === 'darwin') {
    run(`osascript -e 'tell application "System Events" to key code 124'`, 'move-right');
  } else {
    run(`xdotool key Right`, 'move-right');
  }
}

const routes = {
  '/lock': lockScreen,
  '/switch-app': switchApp,
  '/play-pause': playPause,
  '/zoom-in': zoomIn,
  '/zoom-out': zoomOut,
  '/scroll-up': scrollUp,
  '/scroll-down': scrollDown,
  '/move-left': moveLeft,
  '/move-right': moveRight,
};

const server = http.createServer((req, res) => {
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
