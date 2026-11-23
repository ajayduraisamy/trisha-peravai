/* Trisha Peravai — bilingual engine.
   Tamil is the default. The chosen language persists in localStorage and is
   applied to every element carrying a data-i18n* attribute. */
(function () {
  "use strict";

  var STORAGE_KEY = "trisha-peravai-lang";
  var DEFAULT_LANG = "ta";
  var SUPPORTED = ["ta", "en"];
  var dict = window.TRANSLATIONS || {};
  var current = DEFAULT_LANG;

  function readStored() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(value) !== -1) return value;
    } catch (err) {
      /* storage may be blocked; fall back to Tamil */
    }
    return DEFAULT_LANG;
  }

  function interpolate(text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match;
    });
  }

  function t(key, vars) {
    var table = dict[current] || {};
    var fallback = dict[DEFAULT_LANG] || {};
    var value = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : fallback[key];
    if (typeof value !== "string") return key;
    return interpolate(value, vars);
  }

  function setMeta(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.setAttribute("content", value);
  }

  function apply(root) {
    var scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    scope.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });

    scope.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });

    scope.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });

    scope.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      el.setAttribute("content", t(el.getAttribute("data-i18n-content")));
    });

    scope.querySelectorAll("[data-i18n-value]").forEach(function (el) {
      el.setAttribute("value", t(el.getAttribute("data-i18n-value")));
    });
  }

  function setLanguage(lang, options) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    current = lang;

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);

    apply(document);

    document.querySelectorAll("[data-lang-switch]").forEach(function (button) {
      var isActive = button.getAttribute("data-lang-switch") === lang;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    // SEO: title, description, OG/Twitter copy follow the active language.
    var titleNode = document.querySelector("title[data-i18n]");
    if (titleNode) document.title = t(titleNode.getAttribute("data-i18n"));

    var metaDesc = document.querySelector('meta[name="description"][data-i18n-content]');
    if (metaDesc) setMeta('meta[name="description"]', t(metaDesc.getAttribute("data-i18n-content")));
    var ogTitle = document.querySelector('meta[property="og:title"][data-i18n-content]');
    if (ogTitle) setMeta('meta[property="og:title"]', t(ogTitle.getAttribute("data-i18n-content")));
    var ogDesc = document.querySelector('meta[property="og:description"][data-i18n-content]');
    if (ogDesc) setMeta('meta[property="og:description"]', t(ogDesc.getAttribute("data-i18n-content")));
    var twTitle = document.querySelector('meta[name="twitter:title"][data-i18n-content]');
    if (twTitle) setMeta('meta[name="twitter:title"]', t(twTitle.getAttribute("data-i18n-content")));
    var twDesc = document.querySelector('meta[name="twitter:description"][data-i18n-content]');
    if (twDesc) setMeta('meta[name="twitter:description"]', t(twDesc.getAttribute("data-i18n-content")));

    if (!options || options.persist !== false) {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch (err) {
        /* ignore */
      }
    }

    document.dispatchEvent(
      new CustomEvent("languagechange", { detail: { lang: lang } })
    );
  }

  function bindSwitches() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-lang-switch]");
      if (!button) return;
      var lang = button.getAttribute("data-lang-switch");
      if (lang && lang !== current) setLanguage(lang);
    });
  }

  function init() {
    bindSwitches();
    setLanguage(readStored(), { persist: false });
  }

  window.I18N = {
    t: t,
    get lang() {
      return current;
    },
    setLanguage: setLanguage,
    apply: apply,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
