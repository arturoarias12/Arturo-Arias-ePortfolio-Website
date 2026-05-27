/* nav-footer.js — shared navbar link logic and footer for all non-home pages */
(function () {
  'use strict';

  /* 1. Locate this script element to derive site-root without parsing the OS path */
  var scriptEl = document.currentScript ||
                 document.querySelector('script[src$="nav-footer.js"]');
  if (!scriptEl) return;

  /* 2. Depth = number of "../" in the raw src attribute value
        e.g. "nav-footer.js"     → depth 0 → prefix ""
             "../nav-footer.js"  → depth 1 → prefix "../"          */
  var rawSrc = scriptEl.getAttribute('src') || 'nav-footer.js';
  var depth  = (rawSrc.match(/\.\.\//g) || []).length;
  var prefix = depth === 0 ? '' : '../'.repeat(depth);

  /* 3. Page-type detection using absolute URLs (works on file:// and https://) */
  var rootURL  = scriptEl.src.slice(0, scriptEl.src.lastIndexOf('/') + 1);
  var pageURL  = window.location.href.split('?')[0].split('#')[0];
  var rel      = pageURL.indexOf(rootURL) === 0 ? pageURL.slice(rootURL.length) : '';
  /* rel examples: 'about.html', 'projects.html', 'projects/chess-rating-forecasting.html' */

  var isProjects   = rel === 'projects.html'  || rel.slice(0, 9)  === 'projects/';
  var isSkills     = rel === 'skills.html';
  var isBlog       = rel === 'blog.html'      || rel.slice(0, 5)  === 'blog/';
  var isExperience = rel.slice(0, 11) === 'experience/';

  /* 4. Canonical nav definitions */
  var NAV = [
    { label: 'Home',           href: prefix + 'index.html#hero' },
    { label: 'About',          href: prefix + 'index.html#about' },
    { label: 'Experience',     href: prefix + 'index.html#experience',    active: isExperience },
    { label: 'Projects',       href: isProjects ? prefix + 'projects.html'   : prefix + 'index.html#projects',   active: isProjects },
    { label: 'Education',      href: prefix + 'index.html#education' },
    { label: 'Achievements',   href: prefix + 'index.html#achievements' },
    { label: 'Certifications', href: prefix + 'index.html#certifications' },
    { label: 'Insights',       href: isBlog     ? prefix + 'blog.html'        : prefix + 'index.html#blog',       active: isBlog },
    { label: 'Skills',         href: isSkills   ? prefix + 'skills.html'      : prefix + 'index.html#stack',      active: isSkills },
    { label: 'Contact',        href: prefix + 'index.html#contact' },
  ];

  /* 5. Fix brand name color in dark mode.
        Non-home pages have [data-theme="dark"] a { color: #9bb8ff } (specificity 0,1,1)
        which beats .brand { color: var(--text) } (0,1,0). Add a rule with (0,2,0) to win. */
  var brandStyle = document.createElement('style');
  brandStyle.textContent = '[data-theme="dark"] .brand { color: var(--text); }';
  document.head.appendChild(brandStyle);

  /* 7. Update existing nav link elements (attributes only — keeps other listeners intact) */
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var label = a.textContent.trim();
    for (var i = 0; i < NAV.length; i++) {
      if (NAV[i].label === label) {
        a.setAttribute('href', NAV[i].href);
        if (NAV[i].active) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        } else {
          a.classList.remove('active');
          a.removeAttribute('aria-current');
        }
        break;
      }
    }
  });

  /* 8. Brand link and avatar image */
  var brand = document.querySelector('header .brand');
  if (brand) brand.setAttribute('href', prefix + 'index.html');

  var brandImg = document.querySelector('header .brand-mark img');
  if (brandImg) brandImg.setAttribute('src', prefix + 'assets/img/avatar.jpg');

  /* 9. Standardize footer: © year · Back to home */
  var footer = document.querySelector('footer.site-footer') ||
               document.querySelector('body > footer');
  if (footer) {
    var inner = footer.querySelector('.wrap') || footer.querySelector('div') || footer;
    inner.innerHTML =
      '© <span id="nf-year"></span> Arturo Arias' +
      ' · <a href="' + prefix + 'index.html" style="color:inherit;">Back to home</a>';
    document.getElementById('nf-year').textContent = new Date().getFullYear();
  }

  /* Load chat widget */
  var cw = document.createElement('script');
  cw.src = prefix + 'chatbot-widget.js';
  document.body.appendChild(cw);

  /* Load analytics */
  var an = document.createElement('script');
  an.src = prefix + 'js/analytics.js';
  an.defer = true;
  document.body.appendChild(an);

})();
