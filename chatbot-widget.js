/**
 * chatbot-widget.js — floating chat assistant, loaded on every page via nav-footer.js
 *
 * Sends { message } to the Cloudflare Worker; reads { answer } back.
 * RAG retrieval and system prompt are handled server-side (Cloudflare KV + Workers AI).
 */
(function () {
  'use strict';
  if (window.__chatWidgetLoaded) return;
  window.__chatWidgetLoaded = true;

  /* ── CONFIGURE THIS ─────────────────────────────────────────── */
  var WORKER_URL = 'https://eportfolio-chatbot.arturoarias.me/api/chat';
  /* ─────────────────────────────────────────────────────────── */


  /* ── Site root (used to build source chip hrefs) ─────────────*/
  function siteRoot() {
    var el = document.currentScript || document.querySelector('script[src*="chatbot-widget"]');
    if (!el) return '';
    return el.src.substring(0, el.src.lastIndexOf('/') + 1);
  }
  var ROOT = siteRoot();
  function abs(rel) { return (!rel || rel.indexOf('http') === 0) ? rel : ROOT + rel; }

  /* ── CSS ───────────────────────────────────────────────────────*/
  var CSS = [
    /* Self-contained design tokens — widget never inherits from the page */
    '#chat-widget-root{--cw-w:400px;--cw-h:620px;--cw-we:720px;--cw-he:82vh;--cw-shadow:0 16px 48px rgba(10,10,58,0.18),0 0 0 1px rgba(10,10,58,0.06);--primary:rgb(0,0,190);--primary-700:rgb(0,0,150);--bg:#ffffff;--bg-alt:#f5f7fb;--card-bg:#e6f1fb;--text:#0a0a3a;--text-muted:#5f5e5a;--text-soft:#2b2b5a;--border:#e3e8f0;--accent-ok:#1f8a5b;--radius-sm:6px;--radius-md:10px;--radius-lg:16px;--transition:250ms cubic-bezier(.4,0,.2,1)}',
    '[data-theme="dark"] #chat-widget-root{--primary:rgb(41,98,255);--primary-700:rgb(80,130,255);--bg:#050510;--bg-alt:#0d0d2b;--card-bg:#0d0d2b;--text:#e8e8f5;--text-muted:#b0bcdd;--text-soft:#c8cee8;--border:rgba(41,98,255,0.18);--cw-shadow:0 16px 48px rgba(0,0,0,0.52),0 0 0 1px rgba(255,255,255,0.05)}',

    /* launcher */
    '.chat-launcher{position:fixed;bottom:24px;right:24px;z-index:990;border:none;background:var(--primary);color:#fff;border-radius:999px;cursor:pointer;font-family:inherit;padding:0 22px 0 18px;height:56px;display:inline-flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,190,0.32),0 0 0 1px rgba(255,255,255,0.06) inset;font-size:14px;font-weight:600;letter-spacing:-0.005em;transition:transform var(--transition),box-shadow var(--transition),background var(--transition),opacity var(--transition)}',
    '.chat-launcher:hover{background:var(--primary-700);transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,190,0.40),0 0 0 1px rgba(255,255,255,0.06) inset}',
    '.cw-lav{position:relative;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.18);display:grid;place-items:center;font-weight:700;font-size:13px;overflow:hidden}',
    '.cw-ltxt{display:flex;flex-direction:column;align-items:flex-start;line-height:1.2}',
    '.cw-ltxt .cw-sm{font-size:11px;opacity:0.78;font-weight:500}',
    '.chat-launcher.cw-hidden{opacity:0;pointer-events:none;transform:translateY(8px) scale(0.96)}',

    /* panel */
    '.chat-panel{position:fixed;bottom:24px;right:24px;z-index:991;width:var(--cw-w);height:var(--cw-h);max-height:calc(100vh - 48px);background:var(--bg);border-radius:var(--radius-lg);box-shadow:var(--cw-shadow);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(16px) scale(0.98);pointer-events:none;transition:opacity var(--transition),transform var(--transition),width var(--transition),height var(--transition)}',
    '.chat-panel.cw-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',
    '.chat-panel.cw-exp{width:var(--cw-we);height:var(--cw-he)}',

    /* header */
    '.cw-hd{flex-shrink:0;padding:16px 16px 14px;background:var(--primary);color:#fff;display:flex;align-items:center;gap:12px}',
    '.cw-hav{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.18);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;flex-shrink:0;position:relative;overflow:hidden}',
    '.cw-hi{flex:1;min-width:0}',
    '.cw-hn{font-size:15px;font-weight:600;margin:0 0 2px;color:#fff;letter-spacing:-0.01em}',
    '.cw-hs{font-size:12px;color:rgba(255,255,255,0.78);margin:0;display:flex;align-items:center;gap:5px}',
    '.cw-ha{display:flex;gap:4px;flex-shrink:0}',
    '.cw-hbtn{width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.10);color:rgba(255,255,255,0.85);cursor:pointer;display:grid;place-items:center;transition:background var(--transition)}',
    '.cw-hbtn:hover{background:rgba(255,255,255,0.22);color:#fff}',
    '.cw-hbtn svg{width:14px;height:14px}',

    /* disclaimer */
    '.cw-disc{flex-shrink:0;padding:10px 16px;background:var(--card-bg);border-bottom:1px solid var(--border);font-size:12px;color:var(--text-soft);display:flex;align-items:center;gap:8px;line-height:1.45}',
    '[data-theme="dark"] .cw-disc{background:rgba(155,184,255,0.08);color:var(--text-muted)}',
    '.cw-disc svg{width:14px;height:14px;flex-shrink:0;color:var(--primary)}',
    '[data-theme="dark"] .cw-disc svg{color:#9bb8ff}',

    /* body */
    '.cw-body{flex:1;min-height:0;overflow-y:auto;padding:18px 16px 8px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}',
    '.cw-body::-webkit-scrollbar{width:6px}',
    '.cw-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}',

    /* divider */
    '.cw-div{text-align:center;font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin:6px 0 2px;position:relative}',
    '.cw-div::before,.cw-div::after{content:"";position:absolute;top:50%;width:calc(50% - 54px);height:1px;background:var(--border)}',
    '.cw-div::before{left:0}.cw-div::after{right:0}',

    /* messages */
    '.cw-msg{display:flex;gap:10px;max-width:100%;align-items:flex-start}',
    '.cw-msg.user{justify-content:flex-end}',
    '.cw-mav{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-700));color:#fff;display:grid;place-items:center;font-weight:700;font-size:11px;flex-shrink:0;margin-top:2px;overflow:hidden}',
    '.cw-lav img,.cw-hav img,.cw-mav img{width:100%;height:100%;object-fit:cover;display:block}',
    '.cw-bubble{max-width:78%;padding:10px 14px;border-radius:14px;font-size:14.5px;line-height:1.5;color:var(--text-soft);background:var(--bg-alt);border:1px solid var(--border);word-wrap:break-word;overflow-wrap:anywhere}',
    '.cw-msg.assistant .cw-bubble{border-bottom-left-radius:4px}',
    '.cw-msg.user .cw-bubble{background:var(--primary);color:#fff;border-color:var(--primary);border-bottom-right-radius:4px}',
    '[data-theme="dark"] .cw-msg.assistant .cw-bubble{background:var(--bg-alt);color:var(--text)}',
    '.cw-bubble strong{color:var(--text);font-weight:600}',
    '.cw-msg.user .cw-bubble strong{color:#fff}',
    '.cw-bubble code{font-family:"JetBrains Mono",monospace;font-size:0.85em;padding:1px 6px;background:rgba(0,0,190,0.08);border-radius:4px;color:var(--primary)}',
    '[data-theme="dark"] .cw-bubble code{background:rgba(155,184,255,0.15);color:#9bb8ff}',
    '.cw-msg.user .cw-bubble code{background:rgba(255,255,255,0.18);color:#fff}',
    '.cw-bubble p{margin:0 0 8px}.cw-bubble p:last-child{margin-bottom:0}',
    '.cw-bubble ul,.cw-bubble ol{margin:4px 0 8px;padding-left:22px}',
    '.cw-bubble li{margin-bottom:3px}',
    '.cw-bubble a{color:var(--primary)}',
    '[data-theme="dark"] .cw-bubble a{color:#9bb8ff}',
    '.cw-msg.user .cw-bubble a{color:rgba(255,255,255,0.9)}',
    '.cw-welcome .cw-bubble{background:var(--bg-alt);border-color:var(--border);color:var(--text)}',
    '[data-theme="dark"] .cw-welcome .cw-bubble{background:rgba(155,184,255,0.10)}',

    /* message footer */
    '.cw-foot{margin-top:6px;display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-muted)}',
    '.cw-acts{display:flex;gap:2px;margin-left:auto;opacity:0;transition:opacity var(--transition)}',
    '.cw-msg.assistant:hover .cw-acts{opacity:1}',
    '.cw-act{width:22px;height:22px;border:none;background:transparent;border-radius:4px;color:var(--text-muted);cursor:pointer;display:grid;place-items:center;transition:color var(--transition),background var(--transition)}',
    '.cw-act:hover{color:var(--primary);background:var(--card-bg)}',
    '.cw-act svg{width:12px;height:12px}',
    '.cw-act.active{color:var(--primary)}',
    '[data-theme="dark"] .cw-act.active{color:#9bb8ff}',

    /* source chips */
    '.cw-srcs{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px}',
    '.cw-src{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:var(--bg);border:1px solid var(--border);color:var(--primary);font-size:12px;font-weight:500;text-decoration:none;transition:border-color var(--transition),background var(--transition)}',
    '[data-theme="dark"] .cw-src{color:#9bb8ff}',
    '.cw-src:hover{border-color:var(--primary);background:var(--card-bg);text-decoration:none}',
    '.cw-src svg{width:11px;height:11px}',
    '.cw-src-lbl{font-size:11px;color:var(--text-muted);font-weight:500;margin-right:2px;align-self:center}',

    /* typing indicator */
    '.cw-typing{padding:12px 16px;display:inline-flex;gap:4px}',
    '.cw-typing span{width:6px;height:6px;background:var(--text-muted);border-radius:50%;animation:cwDot 1.4s infinite ease-in-out}',
    '.cw-typing span:nth-child(2){animation-delay:0.2s}',
    '.cw-typing span:nth-child(3){animation-delay:0.4s}',
    '@keyframes cwDot{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-4px);opacity:1}}',

    /* suggestion pills */
    '.cw-pills{padding:4px 16px 14px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0}',
    '.cw-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit;font-size:12.5px;font-weight:500;cursor:pointer;transition:color var(--transition),border-color var(--transition),background var(--transition);text-align:left}',
    '[data-theme="dark"] .cw-pill{background:var(--bg-alt)}',
    '.cw-pill:hover{color:var(--primary);border-color:var(--primary);background:var(--card-bg)}',
    '.cw-pill svg{width:13px;height:13px;color:var(--text-muted)}',
    '.cw-pill:hover svg{color:var(--primary)}',

    /* composer */
    '.cw-composer{flex-shrink:0;padding:12px 14px 14px;border-top:1px solid var(--border);background:var(--bg)}',
    '.cw-row{display:flex;align-items:flex-end;gap:8px;background:var(--bg-alt);border:1px solid var(--border);border-radius:16px;padding:6px 6px 6px 12px;transition:border-color var(--transition),box-shadow var(--transition)}',
    '.cw-row:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px rgba(0,0,190,0.10)}',
    '[data-theme="dark"] .cw-row{background:var(--bg)}',
    '.cw-input{flex:1;border:none;background:transparent;resize:none;font-family:inherit;font-size:14.5px;line-height:1.45;color:var(--text);padding:8px 0;outline:none;min-height:22px;max-height:140px;overflow-y:auto}',
    '.cw-input::placeholder{color:var(--text-muted)}',
    '.cw-send{width:36px;height:36px;border:none;border-radius:12px;background:var(--primary);color:#fff;cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:background var(--transition),opacity var(--transition)}',
    '.cw-send:hover{background:var(--primary-700)}',
    '.cw-send:disabled{opacity:0.35;cursor:not-allowed;background:var(--primary)}',
    '.cw-send svg{width:16px;height:16px}',
    '.cw-meta{display:flex;align-items:center;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--text-muted)}',
    '.cw-meta kbd{font-family:"JetBrains Mono",monospace;font-size:10.5px;padding:1px 5px;background:var(--bg-alt);border:1px solid var(--border);border-bottom-width:2px;border-radius:3px;color:var(--text)}',
    '[data-theme="dark"] .cw-meta kbd{background:var(--bg)}',
    '.cw-pwrd{display:inline-flex;align-items:center;gap:5px}',
    '.cw-pwrd::before{content:"";width:5px;height:5px;background:var(--accent-ok);border-radius:50%}',

    /* mobile */
    '@media(max-width:600px){.chat-panel,.chat-panel.cw-exp{width:calc(100vw - 16px);height:calc(100vh - 80px);max-height:calc(100vh - 80px);bottom:72px;right:8px;left:8px}',
    '.chat-launcher{bottom:16px;right:16px;padding:0 18px 0 14px}',
    '.cw-ltxt{display:none}}',
  ].join('');

  /* ── HTML ──────────────────────────────────────────────────────*/
  var AVATAR = '<img src="' + abs('assets/img/chatbot-avatar.png') + '" alt="Arturo Arias" />';
  var HTML = '<button class="chat-launcher" id="cwLauncher" aria-label="Open chat assistant">'
    + '<span class="cw-lav" aria-hidden="true">' + AVATAR + '</span>'
    + '<span class="cw-ltxt"><span>Ask my website</span><span class="cw-sm">Powered by AI</span></span>'
    + '</button>'
    + '<div class="chat-panel" id="cwPanel" role="dialog" aria-label="Chat with Arturo\'s website" aria-hidden="true">'
    + '<header class="cw-hd">'
    + '<div class="cw-hav" aria-hidden="true">' + AVATAR + '</div>'
    + '<div class="cw-hi"><p class="cw-hn">Ask my website</p><p class="cw-hs">AI assistant</p></div>'
    + '<div class="cw-ha">'
    + '<button class="cw-hbtn" id="cwReset" title="New conversation" aria-label="Start new conversation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg></button>'
    + '<button class="cw-hbtn" id="cwExp" title="Expand" aria-label="Expand chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button>'
    + '<button class="cw-hbtn" id="cwClose" title="Close" aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'
    + '</div></header>'
    + '<div class="cw-disc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    + '<span>AI assistant trained on Arturo\'s site content. Always verify anything decision-critical. Responses may omit items, so check the relevant section for the full picture.</span></div>'
    + '<div class="cw-body" id="cwBody">'
    + '<div class="cw-div">Today</div>'
    + '<div class="cw-msg assistant cw-welcome"><div class="cw-mav" aria-hidden="true">' + AVATAR + '</div>'
    + '<div><div class="cw-bubble"><p>Hi! I\'m the assistant for Arturo\'s portfolio.</p>'
    + '<p>Ask me about his projects, experience, skills, or anything you\'d like to know about his work.</p></div>'
    + '<div class="cw-foot"><span>Just now</span></div></div></div>'
    + '</div>'
    + '<div class="cw-pills" id="cwPills">'
    + '<button class="cw-pill" data-q="What does Arturo do?"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>What does Arturo do?</button>'
    + '<button class="cw-pill" data-q="Show me his data science projects"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Data science projects</button>'
    + '<button class="cw-pill" data-q="What is he studying at CMU?"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>What is he studying at CMU?</button>'
    + '<button class="cw-pill" data-q="Is he open to new opportunities?"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 12a19.79 19.79 0 0 1-2.97-8.72A2 2 0 0 1 3.17 1.17h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Open to new opportunities?</button>'
    + '</div>'
    + '<div class="cw-composer">'
    + '<form class="cw-row" id="cwForm"><textarea class="cw-input" id="cwInput" rows="1" placeholder="Ask anything about Arturo\'s work…" aria-label="Type a message"></textarea>'
    + '<button class="cw-send" type="submit" id="cwSend" aria-label="Send" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>'
    + '</form>'
    + '<div class="cw-meta"><span><kbd>Enter</kbd> to send &middot; <kbd>Shift</kbd>+<kbd>Enter</kbd> new line</span><span class="cw-pwrd">Powered by AI</span></div>'
    + '</div>'
    + '</div>';

  /* ── Markdown renderer (subset) ──────────────────────────────── */
  function renderMd(text) {
    function esc(s) { return s.replace(/[&<>"]/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
    function inline(s) {
      return esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    var lines = text.split('\n'), out = [], inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\s+$/, '');
      var m = line.match(/^\s*[-*]\s+(.*)/);
      if (m) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inline(m[1]) + '</li>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        if (!line.trim()) continue;
        out.push('<p>' + inline(line) + '</p>');
      }
    }
    if (inList) out.push('</ul>');
    return out.join('');
  }

  /* ── Source chip rendering ───────────────────────────────────── */
  var PAGE_LABELS = { 'index.html': 'Home', 'projects.html': 'Projects', 'skills.html': 'Skills', 'blog.html': 'Insights', 'about.html': 'About' };

  function parseSources(raw) {
    if (!Array.isArray(raw) || !raw.length) return [];
    return raw.slice(0, 3).map(function(s) {
      if (typeof s === 'string') {
        return { label: PAGE_LABELS[s] || s.replace(/^.*\//, '').replace('.html', ''), url: abs(s) };
      }
      var url = s.url || s.file || '';
      var label = s.title || PAGE_LABELS[url] || url.replace(/^.*\//, '').replace('.html', '');
      return { label: label, url: abs(url) };
    });
  }

  /* ── Icons (reused SVG strings) ──────────────────────────────── */
  var ICO_LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  var ICO_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

  /* ── Widget logic ────────────────────────────────────────────── */
  function init() {
    var style = document.createElement('style');
    style.id = 'cw-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.id = 'chat-widget-root';
    root.innerHTML = HTML;
    document.body.appendChild(root);

    var launcher = document.getElementById('cwLauncher');
    var panel    = document.getElementById('cwPanel');
    var body     = document.getElementById('cwBody');
    var pills    = document.getElementById('cwPills');
    var form     = document.getElementById('cwForm');
    var input    = document.getElementById('cwInput');
    var send     = document.getElementById('cwSend');
    var closeBtn = document.getElementById('cwClose');
    var expBtn   = document.getElementById('cwExp');
    var resetBtn = document.getElementById('cwReset');

    var busy = false;
    var msgs = [];
    var pillsGone = false;

    function saveSession() {
      try {
        sessionStorage.setItem('cw_state', JSON.stringify({
          open: panel.classList.contains('cw-open'),
          pills: pillsGone,
          msgs: msgs,
        }));
      } catch(_) {}
    }

    function open()  { panel.classList.add('cw-open'); panel.setAttribute('aria-hidden','false'); launcher.classList.add('cw-hidden'); saveSession(); setTimeout(function(){ input.focus(); }, 250); }
    function close() { panel.classList.remove('cw-open'); panel.setAttribute('aria-hidden','true'); launcher.classList.remove('cw-hidden'); saveSession(); }

    function track(name, params) {
      if (typeof window.pushEvent === 'function') window.pushEvent(name, params || {});
    }

    launcher.addEventListener('click', function () {
      var s; try { s = JSON.parse(sessionStorage.getItem('cw_state')); } catch (_) {}
      track('chatbot_open', {
        trigger:             'launcher_button',
        session_has_history: !!(s && Array.isArray(s.msgs) && s.msgs.length),
      });
      open();
    });
    closeBtn.addEventListener('click', function () {
      track('chatbot_close', { trigger: 'close_button', message_count: msgs.length });
      close();
    });
    expBtn.addEventListener('click', function() {
      panel.classList.toggle('cw-exp');
      track('chatbot_expand', { expanded: panel.classList.contains('cw-exp') });
    });
    resetBtn.addEventListener('click', function() {
      if (busy) return;
      track('chatbot_reset', { messages_cleared: msgs.length });
      msgs = []; pillsGone = false;
      var kids = Array.prototype.slice.call(body.children);
      kids.forEach(function(el, i) { if (i > 1) el.remove(); });
      pills.style.display = 'flex';
      saveSession();
    });

    function autoGrow() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 140) + 'px'; }
    input.addEventListener('input', function() { autoGrow(); send.disabled = !input.value.trim() || busy; });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!send.disabled) { form.dataset.trigger = 'enter_key'; form.requestSubmit(); }
      }
    });
    pills.addEventListener('click', function(e) {
      var btn = e.target.closest('.cw-pill');
      if (!btn) return;
      var pills_list = Array.prototype.slice.call(pills.querySelectorAll('.cw-pill'));
      track('chatbot_suggestion_click', {
        suggestion_text: btn.dataset.q || btn.textContent.trim(),
        pill_index:      pills_list.indexOf(btn),
      });
      input.value = btn.dataset.q; autoGrow(); send.disabled = false; form.requestSubmit();
    });

    function ts() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    function scrollEnd() { requestAnimationFrame(function() { body.scrollTop = body.scrollHeight; }); }

    function addUser(text) {
      var row = document.createElement('div');
      row.className = 'cw-msg user';
      var bubble = document.createElement('div');
      bubble.className = 'cw-bubble';
      bubble.textContent = text;
      var foot = document.createElement('div');
      foot.className = 'cw-foot';
      foot.style.justifyContent = 'flex-end';
      foot.innerHTML = '<span>' + ts() + '</span>';
      var wrap = document.createElement('div');
      wrap.appendChild(bubble); wrap.appendChild(foot);
      row.appendChild(wrap);
      body.appendChild(row); scrollEnd();
    }

    function addTyping() {
      var row = document.createElement('div');
      row.className = 'cw-msg assistant';
      row.innerHTML = '<div class="cw-mav" aria-hidden="true">' + AVATAR + '</div>'
        + '<div><div class="cw-bubble cw-typing"><span></span><span></span><span></span></div></div>';
      body.appendChild(row); scrollEnd(); return row;
    }

    function finalizeAssistant(row, text, sources) {
      var bubble = row.querySelector('.cw-bubble');
      bubble.classList.remove('cw-typing');
      bubble.innerHTML = renderMd(text);

      var wrapper = bubble.parentElement;

      if (sources.length) {
        var srcs = document.createElement('div');
        srcs.className = 'cw-srcs';
        srcs.innerHTML = '<span class="cw-src-lbl">Sources</span>'
          + sources.map(function(s) {
            return '<a class="cw-src" href="' + s.url + '">' + ICO_LINK + s.label + '</a>';
          }).join('');
        srcs.querySelectorAll('.cw-src').forEach(function(a, idx) {
          a.addEventListener('click', function() {
            track('chatbot_source_click', {
              source_label: a.textContent.trim(),
              source_url:   a.getAttribute('href'),
              source_index: idx,
            });
          });
        });
        wrapper.appendChild(srcs);
      }

      var foot = document.createElement('div');
      foot.className = 'cw-foot';
      foot.innerHTML = '<span>' + ts() + '</span>'
        + '<div class="cw-acts">'
        + '<button class="cw-act cw-copy" title="Copy" aria-label="Copy response"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>'
        + '<button class="cw-act cw-up" title="Helpful" aria-label="Helpful"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9A2 2 0 0 0 19.66 9H14zM2 9h4v13H2z"/></svg></button>'
        + '<button class="cw-act cw-dn" title="Not helpful" aria-label="Not helpful"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9A2 2 0 0 0 4.34 15H10zM22 15h-4V2h4z"/></svg></button>'
        + '</div>';
      wrapper.appendChild(foot);

      foot.querySelector('.cw-copy').addEventListener('click', function() {
        var btn = foot.querySelector('.cw-copy');
        var orig = btn.innerHTML;
        try { navigator.clipboard.writeText(text); } catch(_) {}
        track('chatbot_copy_response', {});
        btn.innerHTML = ICO_CHECK;
        setTimeout(function() { btn.innerHTML = orig; }, 1400);
      });
      foot.querySelectorAll('.cw-up,.cw-dn').forEach(function(b) {
        b.addEventListener('click', function() {
          foot.querySelectorAll('.cw-up,.cw-dn').forEach(function(x) { x.classList.remove('active'); });
          b.classList.add('active');
          track('chatbot_feedback', { feedback: b.classList.contains('cw-up') ? 'helpful' : 'not_helpful' });
        });
      });
      scrollEnd();
    }

    function ask(text, trigger) {
      if (busy) return;
      busy = true; send.disabled = true;
      pillsGone = true; pills.style.display = 'none';
      track('chatbot_message_send', {
        message_length:        text.length,
        session_message_count: msgs.filter(function(m) { return m.role === 'user'; }).length,
        trigger:               trigger || 'send_button',
      });
      msgs.push({ role: 'user', text: text });
      addUser(text);
      input.value = ''; autoGrow();

      var typing = addTyping();
      var t0 = Date.now();

      fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentUrl: window.location.href,
          currentPath: window.location.pathname + window.location.hash,
          currentTitle: document.title,
        }),
      }).then(function(res) {
        return res.json();
      }).then(function(data) {
        var reply = data.answer || data.error || "I couldn't get a response. Please try again.";
        var sources = parseSources(data.sources);
        track('chatbot_response_received', {
          response_length: reply.length,
          has_sources:     sources.length > 0,
          source_count:    sources.length,
          latency_ms:      Date.now() - t0,
        });
        msgs.push({ role: 'assistant', text: reply, sources: sources });
        finalizeAssistant(typing, reply, sources);
        saveSession();
      }).catch(function() {
        track('chatbot_error', { error_type: 'network_error' });
        var fb = "I can't answer right now. Please contact Arturo directly at aaarias@andrew.cmu.edu or via the contact form.";
        var fbSrc = [{ label: 'Contact', url: abs('index.html#contact') }];
        msgs.push({ role: 'assistant', text: fb, sources: fbSrc });
        finalizeAssistant(typing, fb, fbSrc);
        saveSession();
      }).finally(function() {
        busy = false;
        send.disabled = !input.value.trim();
      });
    }

    /* ── Restore session across page navigations ─────────────── */
    (function() {
      var s; try { s = JSON.parse(sessionStorage.getItem('cw_state')); } catch(_) {}
      if (!s) return;
      if (s.pills) { pillsGone = true; pills.style.display = 'none'; }
      if (Array.isArray(s.msgs) && s.msgs.length) {
        msgs = s.msgs;
        s.msgs.forEach(function(m) {
          if (m.role === 'user') {
            addUser(m.text);
          } else {
            var row = document.createElement('div');
            row.className = 'cw-msg assistant';
            row.innerHTML = '<div class="cw-mav" aria-hidden="true">' + AVATAR + '</div><div><div class="cw-bubble"></div></div>';
            body.appendChild(row);
            finalizeAssistant(row, m.text, m.sources || []);
          }
        });
      }
      if (s.open) { open(); }
    })();

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || busy) return;
      var trigger = form.dataset.trigger || 'send_button';
      delete form.dataset.trigger;
      ask(text, trigger);
    });

    /* subtle pulse after 2s if not already open */
    setTimeout(function() {
      if (!panel.classList.contains('cw-open') && launcher.animate) {
        launcher.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }],
          { duration: 900, iterations: 2, easing: 'ease-in-out' }
        );
      }
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
