/* CSOS homepage - small vanilla script: mobile menu, header shadow, hero carousel, sub-nav state */
(function () {
  "use strict";

  /* mobile menu */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector(".sr").textContent = open ? "메뉴 닫기" : "메뉴 열기";
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { setOpen(false); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
  }

  /* header shadow on scroll */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 4); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* sub-nav: collapsed by default on narrow screens, highlight current section */
  var box = document.querySelector(".subnav-box");
  if (box) {
    if (window.matchMedia("(max-width: 960px)").matches) { box.removeAttribute("open"); }
    box.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.matchMedia("(max-width: 960px)").matches) { box.removeAttribute("open"); }
    });
    var links = Array.prototype.slice.call(box.querySelectorAll("a[href^='#']"));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var ticking = false;
    var mark = function () {
      ticking = false;
      var cur = null;
      for (var i = targets.length - 1; i >= 0; i--) {
        if (targets[i] && targets[i].getBoundingClientRect().top < 140) { cur = targets[i].id; break; }
      }
      var aside = box.parentNode;
      links.forEach(function (a) {
        var on = cur !== null && a.getAttribute("href") === "#" + cur;
        a.classList.toggle("is-current", on);
        if (on && aside.scrollHeight > aside.clientHeight) {
          // keep the current item visible inside the sticky, scrollable sub-nav
          var ar = a.getBoundingClientRect();
          var sr = aside.getBoundingClientRect();
          if (ar.top < sr.top || ar.bottom > sr.bottom) {
            aside.scrollTop += ar.top - sr.top - sr.height / 2;
          }
        }
      });
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(mark); }
    }, { passive: true });
    mark();
  }

  /* hero carousel */
  var hero = document.querySelector(".hero");
  if (hero) {
    var slides = hero.querySelectorAll(".slide");
    var dots = hero.querySelectorAll(".dot");
    var pauseBtn = hero.querySelector(".hero-pause");
    var idx = 0;
    var timer = null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = reduced;
    var hover = false;
    var show = function (n) {
      idx = (n + slides.length) % slides.length;
      for (var i = 0; i < slides.length; i++) {
        var on = i === idx;
        slides[i].classList.toggle("is-active", on);
        if (on) { slides[i].removeAttribute("aria-hidden"); } else { slides[i].setAttribute("aria-hidden", "true"); }
        slides[i].querySelectorAll("a").forEach(function (a) { a.tabIndex = on ? 0 : -1; });
        dots[i].classList.toggle("is-active", on);
        if (on) { dots[i].setAttribute("aria-current", "true"); } else { dots[i].removeAttribute("aria-current"); }
      }
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () {
      stop();
      if (!paused && !hover) { timer = setInterval(function () { show(idx + 1); }, 6500); }
    };
    var setPaused = function (p) {
      paused = p;
      pauseBtn.setAttribute("aria-pressed", p ? "true" : "false");
      pauseBtn.setAttribute("aria-label", p ? "자동 넘김 시작" : "자동 넘김 멈춤");
      pauseBtn.innerHTML = p ? "&#9654;" : "&#10074;&#10074;";
      start();
    };
    hero.querySelector(".hero-prev").addEventListener("click", function () { show(idx - 1); start(); });
    hero.querySelector(".hero-next").addEventListener("click", function () { show(idx + 1); start(); });
    dots.forEach(function (d) {
      d.addEventListener("click", function () { show(parseInt(d.getAttribute("data-i"), 10)); start(); });
    });
    pauseBtn.addEventListener("click", function () { setPaused(!paused); });
    hero.addEventListener("mouseenter", function () { hover = true; stop(); });
    hero.addEventListener("mouseleave", function () { hover = false; start(); });
    hero.addEventListener("focusin", function () { hover = true; stop(); });
    hero.addEventListener("focusout", function () { hover = false; start(); });
    show(0);
    setPaused(paused);
  }
})();
