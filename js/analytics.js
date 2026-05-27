/**
 * analytics.js — GTM dataLayer event tracking for all public pages.
 * Loaded on every page: via <script> in index.html, via nav-footer.js elsewhere.
 * Exposes window.pushEvent() so chatbot-widget.js can push widget events.
 */
(function () {
  'use strict';
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];

  /* ── Page context ──────────────────────────────────────────────── */
  function getPageType() {
    var p = window.location.pathname.replace(/^\//, '');
    if (!p || p === 'index.html') return 'home';
    if (p === 'about.html')    return 'about';
    if (p === 'skills.html')   return 'skills';
    if (p === 'projects.html') return 'projects';
    if (p === 'blog.html')     return 'blog';
    if (p.slice(0, 9)  === 'projects/')  return 'project_detail';
    if (p.slice(0, 5)  === 'blog/')      return 'blog_post';
    if (p.slice(0, 11) === 'experience/') return 'experience';
    return 'other';
  }

  var pageType = getPageType();

  function pushEvent(name, params) {
    window.dataLayer.push(Object.assign({
      event:          name,
      page_location:  window.location.href,
      page_path:      window.location.pathname + window.location.search + window.location.hash,
      page_title:     document.title,
      page_type:      pageType,
    }, params || {}));
  }

  window.pushEvent = pushEvent;

  /* ── Helpers ───────────────────────────────────────────────────── */
  function up(el, sel) {
    while (el && el !== document) {
      if (el.matches && el.matches(sel)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function isExternal(href) {
    if (!href || href.charAt(0) === '#') return false;
    try { return new URL(href, window.location.href).hostname !== window.location.hostname; }
    catch (_) { return false; }
  }

  function nearestId(el) {
    while (el && el !== document.body) {
      if (el.id) return el.id;
      el = el.parentElement;
    }
    return 'unknown';
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, c = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(c, a); }, ms);
    };
  }

  function countVisible(sel) {
    var els = document.querySelectorAll(sel), n = 0;
    for (var i = 0; i < els.length; i++) {
      if (els[i].style.display !== 'none' && !els[i].hidden) n++;
    }
    return n;
  }

  /* ── 1. Nav link clicks ────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = up(e.target, '.nav-links a');
    if (!a) return;
    pushEvent('nav_link_click', {
      link_text: a.textContent.trim(),
      link_href: a.getAttribute('href'),
      is_active: a.classList.contains('active'),
    });
  });

  /* ── 2. Mobile hamburger ───────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = up(e.target, '#navHamburger, .nav-hamburger');
    if (!btn) return;
    var navbar = document.querySelector('.navbar');
    var willOpen = navbar && !navbar.classList.contains('nav-open');
    pushEvent(willOpen ? 'mobile_menu_open' : 'mobile_menu_close', {});
  });

  /* ── 3. Back link ──────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = up(e.target, '.back-link');
    if (!a) return;
    pushEvent('back_link_click', {
      link_text: a.textContent.trim(),
      link_href: a.getAttribute('href'),
    });
  });

  /* ── 4. Back to top ────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!up(e.target, '.back-top')) return;
    pushEvent('back_to_top_click', {});
  });

  /* ── 5. Footer link ────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!up(e.target, 'footer a')) return;
    pushEvent('footer_link_click', {});
  });

  /* ── 6. Theme toggle ───────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!up(e.target, '#themeToggle')) return;
    var cur = document.documentElement.getAttribute('data-theme');
    pushEvent('theme_toggle', { new_theme: cur === 'dark' ? 'light' : 'dark' });
  });

  /* ── 7. Resume dropdown open ───────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!up(e.target, '#resumeBtn')) return;
    var menu = document.querySelector('.resume-menu');
    if (!menu || !menu.classList.contains('open')) {
      pushEvent('resume_dropdown_open', {});
    }
  });

  /* ── 8. Resume download ────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = up(e.target, '.resume-list a, #resumeList a, [role="menuitem"]');
    if (!a || !up(a, '.resume-menu, #resumeMenu')) return;
    pushEvent('resume_download', {
      resume_type: a.textContent.trim(),
      file_url:    a.getAttribute('href'),
    });
  });

  /* ── 9. Hero CTA ("View My Work") ─────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = up(e.target, '.hero-btns .btn, .hero-ctas .btn');
    if (!a || up(a, '.resume-menu, #resumeMenu')) return;
    pushEvent('hero_cta_click', {
      label:       a.textContent.trim(),
      destination: a.getAttribute('href'),
    });
  });

  /* ── 10. Social links ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = up(e.target, '.hero-socials a, .social-links a, .contact-links a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    pushEvent('social_link_click', {
      platform:  href.includes('linkedin') ? 'LinkedIn'
               : href.includes('github')   ? 'GitHub'
               : href.includes('kaggle')   ? 'Kaggle'
               : href.includes('mailto')   ? 'Email'
               : 'Other',
      section:   up(a, '.hero-socials') ? 'hero' : 'contact',
      link_href: href,
    });
  });

  /* ── 11. Share / copy URL ──────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!up(e.target, '#shareBtn, .hero-share')) return;
    pushEvent('share_click', {});
  });

  /* ── 12. Contact form ──────────────────────────────────────────── */
  (function () {
    var formEl = document.getElementById('contactForm');
    if (!formEl) return;

    var started = false;
    formEl.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      pushEvent('form_start', {});
    });

    formEl.addEventListener('submit', function () {
      var n = document.getElementById('cf-name');
      var em = document.getElementById('cf-email');
      var msg = document.getElementById('cf-msg');
      pushEvent('form_submit', {
        has_name:       !!(n && n.value.trim()),
        has_email:      !!(em && em.value.trim()),
        has_message:    !!(msg && msg.value.trim()),
        message_length: msg ? msg.value.trim().length : 0,
      });
    });

    var statusEl = document.getElementById('formStatus');
    if (statusEl) {
      new MutationObserver(function () {
        var txt = statusEl.textContent.trim();
        if (!txt) return;
        if (statusEl.style.color) {
          pushEvent('form_submit_error', { error_message: txt });
        } else {
          pushEvent('form_submit_success', {});
        }
      }).observe(statusEl, { childList: true, characterData: true, subtree: true });
    }
  })();

  /* ── 13. Email CTA ─────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!up(e.target, '.email-cta')) return;
    pushEvent('email_cta_click', {});
  });

  /* ── 14. Certifications carousel ──────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = up(e.target, '.carousel-nav .prev, .carousel-nav .next, .carousel-btn');
    if (!btn) return;
    pushEvent('carousel_navigate', {
      direction:   btn.classList.contains('prev') ? 'prev' : 'next',
      carousel_id: 'certifications',
    });
  });

  /* ── 15–21. Projects page ──────────────────────────────────────── */
  if (pageType === 'projects' || pageType === 'home') {

    if (pageType === 'projects') {
      var pSearch = document.getElementById('searchInput');
      if (pSearch) {
        pSearch.addEventListener('input', debounce(function () {
          var q = pSearch.value.trim();
          if (!q) return;
          pushEvent('search_query', { search_term: q, results_count: countVisible('.project-card'), context: 'projects' });
        }, 600));
      }

      var pCatChips = document.getElementById('categoryChips');
      if (pCatChips) {
        pCatChips.addEventListener('click', function (e) {
          var chip = up(e.target, 'button.chip, .chip');
          if (!chip) return;
          setTimeout(function () {
            pushEvent('filter_category_click', {
              category:      chip.textContent.replace(/[\d()]/g, '').trim(),
              results_count: countVisible('.project-card'),
              context:       'projects',
            });
          }, 50);
        });
      }

      var pTagChips = document.getElementById('tagChips');
      if (pTagChips) {
        pTagChips.addEventListener('click', function (e) {
          var chip = up(e.target, 'button.chip, .chip');
          if (!chip) return;
          var wasActive = chip.classList.contains('active');
          setTimeout(function () {
            pushEvent('filter_tag_click', {
              tag:           chip.textContent.replace(/[\d()]/g, '').trim(),
              action:        wasActive ? 'remove' : 'add',
              source:        'filter_bar',
              results_count: countVisible('.project-card'),
              context:       'projects',
            });
          }, 50);
        });
      }

      var pSort = document.getElementById('sortSelect');
      if (pSort) {
        pSort.addEventListener('change', function () {
          var opt = pSort.options[pSort.selectedIndex];
          pushEvent('sort_change', { sort_by: opt ? opt.text : pSort.value, context: 'projects' });
        });
      }

      var pView = document.getElementById('viewToggle');
      if (pView) {
        pView.addEventListener('click', function (e) {
          var btn = up(e.target, 'button[data-view]');
          if (!btn) return;
          pushEvent('view_toggle', { view: btn.getAttribute('data-view'), context: 'projects' });
        });
      }

      var pClear = document.getElementById('clearAll');
      if (pClear) {
        pClear.addEventListener('click', function () {
          pushEvent('filters_clear', { context: 'projects' });
        });
      }
    }

    /* Project card title click (projects list + home carousel) */
    document.addEventListener('click', function (e) {
      var a = up(e.target, '.project-card h2 a, .project-card h3 a, .project-card .card-title a');
      if (!a) return;
      var card = up(a, '.project-card');
      var titleEl = card && (card.querySelector('h2, h3, .card-title'));
      pushEvent('project_card_click', {
        project_name: titleEl ? titleEl.textContent.trim() : a.textContent.trim(),
        destination:  a.getAttribute('href'),
        source_page:  pageType === 'home' ? 'home_carousel' : 'projects_list',
      });
    });

    /* Inline card tag buttons */
    document.addEventListener('click', function (e) {
      var btn = up(e.target, '.project-card button.tag, button.tag[data-tag]');
      if (!btn) return;
      var wasActive = btn.classList.contains('active');
      setTimeout(function () {
        pushEvent('filter_tag_click', {
          tag:           btn.dataset.tag || btn.textContent.trim(),
          action:        wasActive ? 'remove' : 'add',
          source:        'card',
          results_count: countVisible('.project-card'),
          context:       'projects',
        });
      }, 50);
    });

    /* Project detail / external links inside cards */
    document.addEventListener('click', function (e) {
      var a = up(e.target, '.project-card .proj-link, .project-card .project-link');
      if (!a) return;
      var card = up(a, '.project-card');
      var titleEl = card && card.querySelector('h2, h3, .card-title');
      var txt = a.textContent.trim().toLowerCase();
      var kind = a.dataset.kind
              || (txt.includes('github')   ? 'github'
                : txt.includes('demo')     ? 'demo'
                : txt.includes('paper')    ? 'paper'
                : txt.includes('notebook') ? 'notebook'
                : txt.includes('detail')   ? 'details'
                : 'link');
      pushEvent('project_link_click', {
        project_name: titleEl ? titleEl.textContent.trim() : 'unknown',
        link_type:    kind,
        link_href:    a.getAttribute('href'),
      });
    });
  }

  /* ── 22–27. Skills page ────────────────────────────────────────── */
  if (pageType === 'skills') {
    var sSearch = document.getElementById('searchInput');
    if (sSearch) {
      sSearch.addEventListener('input', debounce(function () {
        var q = sSearch.value.trim();
        if (!q) return;
        pushEvent('search_query', { search_term: q, results_count: countVisible('.skill-card'), context: 'skills' });
      }, 600));
    }

    var sCatChips = document.getElementById('categoryChips');
    if (sCatChips) {
      sCatChips.addEventListener('click', function (e) {
        var chip = up(e.target, 'button.chip, .chip');
        if (!chip) return;
        setTimeout(function () {
          pushEvent('filter_category_click', {
            category:      chip.textContent.replace(/[\d()]/g, '').trim(),
            results_count: countVisible('.skill-card'),
            context:       'skills',
          });
        }, 50);
      });
    }

    var sLvlChips = document.getElementById('levelChips');
    if (sLvlChips) {
      sLvlChips.addEventListener('click', function (e) {
        var chip = up(e.target, 'button.chip, .chip');
        if (!chip) return;
        var wasActive = chip.classList.contains('active');
        setTimeout(function () {
          pushEvent('filter_level_click', {
            level:         chip.textContent.replace(/[\d()]/g, '').trim(),
            action:        wasActive ? 'remove' : 'add',
            results_count: countVisible('.skill-card'),
          });
        }, 50);
      });
    }

    var sSort = document.getElementById('sortSelect');
    if (sSort) {
      sSort.addEventListener('change', function () {
        var opt = sSort.options[sSort.selectedIndex];
        pushEvent('sort_change', { sort_by: opt ? opt.text : sSort.value, context: 'skills' });
      });
    }

    var sView = document.getElementById('viewToggle');
    if (sView) {
      sView.addEventListener('click', function (e) {
        var btn = up(e.target, 'button[data-view]');
        if (!btn) return;
        pushEvent('view_toggle', { view: btn.getAttribute('data-view'), context: 'skills' });
      });
    }

    var sClear = document.getElementById('clearAll');
    if (sClear) {
      sClear.addEventListener('click', function () {
        pushEvent('filters_clear', { context: 'skills' });
      });
    }
  }

  /* ── 28–33. Blog page ──────────────────────────────────────────── */
  if (pageType === 'blog') {
    var bSearch = document.getElementById('searchInput');
    if (bSearch) {
      bSearch.addEventListener('input', debounce(function () {
        var q = bSearch.value.trim();
        if (!q) return;
        pushEvent('search_query', { search_term: q, results_count: countVisible('.post-card, .blog-card'), context: 'blog' });
      }, 600));
    }

    var bTagChips = document.getElementById('tagChips');
    if (bTagChips) {
      bTagChips.addEventListener('click', function (e) {
        var chip = up(e.target, 'button.chip, .chip');
        if (!chip) return;
        var wasActive = chip.classList.contains('active');
        setTimeout(function () {
          pushEvent('filter_tag_click', {
            tag:     chip.textContent.replace(/[\d()]/g, '').trim(),
            action:  wasActive ? 'remove' : 'add',
            source:  'filter_bar',
            context: 'blog',
          });
        }, 50);
      });
    }

    document.addEventListener('click', function (e) {
      var btn = up(e.target, '.post-tag[data-tag-click], span.post-tag');
      if (!btn) return;
      pushEvent('filter_tag_click', {
        tag:    btn.textContent.trim(),
        action: 'add',
        source: 'card',
        context: 'blog',
      });
    });

    var bSort = document.getElementById('sortSelect');
    if (bSort) {
      bSort.addEventListener('change', function () {
        var opt = bSort.options[bSort.selectedIndex];
        pushEvent('sort_change', { sort_by: opt ? opt.text : bSort.value, context: 'blog' });
      });
    }

    var bClear = document.getElementById('clearAll');
    if (bClear) {
      bClear.addEventListener('click', function () {
        pushEvent('filters_clear', { context: 'blog' });
      });
    }

    document.addEventListener('click', function (e) {
      var a = up(e.target, '.post-card a[href], .blog-card a[href], .featured-post a[href]');
      if (!a) return;
      var card = up(a, '.post-card, .blog-card, .featured-post');
      var titleEl = card && card.querySelector('h2, h3');
      pushEvent('post_click', {
        post_title: titleEl ? titleEl.textContent.trim() : a.textContent.trim(),
        post_href:  a.getAttribute('href'),
      });
    });
  }

  /* ── 34. About page tabs ───────────────────────────────────────── */
  if (pageType === 'about') {
    document.addEventListener('click', function (e) {
      var a = up(e.target, '#tabsRow .tab');
      if (!a) return;
      pushEvent('tab_click', {
        tab: (a.getAttribute('href') || '').replace('#', ''),
      });
    });
  }

  /* ── 35. Project detail CTAs and pagination ────────────────────── */
  if (pageType === 'project_detail') {
    document.addEventListener('click', function (e) {
      var a = up(e.target, 'header .btn, .proj-header .btn, .project-header .btn');
      if (!a) return;
      var h1 = document.querySelector('h1');
      var txt = a.textContent.trim().toLowerCase();
      pushEvent('project_cta_click', {
        project_name: h1 ? h1.textContent.trim() : document.title,
        cta_label:    a.textContent.trim(),
        link_type:    txt.includes('github')   ? 'github'
                    : txt.includes('demo')     ? 'demo'
                    : txt.includes('paper')    ? 'paper'
                    : txt.includes('notebook') ? 'notebook'
                    : txt.includes('video')    ? 'video'
                    : 'link',
        link_href:    a.getAttribute('href'),
      });
    });

    document.addEventListener('click', function (e) {
      var a = up(e.target, '.pager a');
      if (!a) return;
      pushEvent('project_pager_click', {
        direction:   a.classList.contains('prev') ? 'prev' : 'next',
        destination: a.getAttribute('href'),
      });
    });
  }

  /* ── 36. External link catch-all ───────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = up(e.target, 'a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!isExternal(href)) return;
    /* Skip events already captured by more specific handlers */
    if (up(a, '.resume-menu, #resumeMenu'))         return;
    if (up(a, '.hero-socials, .social-links, .contact-links')) return;
    if (up(a, '.email-cta'))                        return;
    if (up(a, '.project-card .proj-link, .project-card .project-link')) return;
    if (pageType === 'project_detail' && up(a, 'header .btn, .proj-header .btn')) return;

    var domain;
    try { domain = new URL(href).hostname; } catch (_) { domain = href; }
    pushEvent('external_link_click', {
      link_text:   (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 80),
      link_href:   href,
      link_domain: domain,
      section:     nearestId(a),
    });
  });

})();
