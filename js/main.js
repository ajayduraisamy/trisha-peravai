/* Trisha Peravai — navigation, forms, share helpers. */
(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  /* ---------------------------------------------------------------- nav more */
  function initNavMore() {
    var nav = document.querySelector("[data-main-nav]");
    var more = document.querySelector("[data-nav-more]");
    var moreBtn = document.querySelector("[data-nav-more-btn]");
    var moreMenu = document.querySelector("[data-nav-more-menu]");
    if (!nav || !more || !moreBtn || !moreMenu) return;

    function closeMore() { more.classList.remove("is-open"); moreBtn.setAttribute("aria-expanded", "false"); }

    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = more.classList.toggle("is-open");
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) { if (more.classList.contains("is-open") && !more.contains(e.target)) closeMore(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && more.classList.contains("is-open")) { closeMore(); moreBtn.focus(); } });

    function layout() {
      closeMore();
      // move all back
      [].slice.call(moreMenu.querySelectorAll("[data-nav-item]")).forEach(function (a) { nav.insertBefore(a, more); });
      more.hidden = true;
      if (window.innerWidth < 1200) return;
      var items = [].slice.call(nav.querySelectorAll("[data-nav-item]"));
      if (!items.length) return;
      // check overflow
      function overflows() { return nav.scrollWidth > nav.clientWidth + 2; }
      if (!overflows()) return;
      more.hidden = false;
      for (var i = items.length - 1; i >= 0; i--) {
        moreMenu.insertBefore(items[i], moreMenu.firstChild);
        if (!overflows()) break;
      }
      if (!moreMenu.children.length) more.hidden = true;
      moreBtn.classList.toggle("is-active", !!moreMenu.querySelector(".is-active"));
    }

    var raf;
    window.addEventListener("resize", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); });
    if (window.I18N) document.addEventListener("languagechange", function () { layout(); });
    layout();
    // re-run after fonts/icons settle
    window.addEventListener("load", layout);
    setTimeout(layout, 200);
  }

  /* ---------------------------------------------------------------- nav dropdown */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var dropdown = document.querySelector("[data-nav-dropdown]");
    var wrap = document.querySelector("[data-nav-wrap]");
    if (!toggle || !dropdown) return;

    var setOpen = function (open) {
      dropdown.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", t(open ? "nav.closeMenu" : "nav.openMenu"));
      if (open) {
        var first = dropdown.querySelector("a");
        if (first) window.setTimeout(function () { first.focus(); }, 60);
      }
    };

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!dropdown.classList.contains("is-open"));
    });

    dropdown.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.classList.contains("is-open")) return;
      if (wrap && wrap.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && dropdown.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("languagechange", function () {
      var open = dropdown.classList.contains("is-open");
      toggle.setAttribute("aria-label", t(open ? "nav.closeMenu" : "nav.openMenu"));
    });
  }

  /* -------------------------------------------------------------------- year */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
    document.querySelectorAll("[data-year-text]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-year-text"), { year: year });
    });
  }

  /* ------------------------------------------------------------- back to top */
  function initBackToTop() {
    document.querySelectorAll("[data-back-to-top]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
    });
  }

  /* ------------------------------------------------------------------- toast */
  var toastTimer = null;
  function toast(message) {
    var node = document.querySelector(".toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      node.classList.remove("is-visible");
    }, 2400);
  }

  function initShare() {
    document.querySelectorAll("[data-share]").forEach(function (link) {
      var network = link.getAttribute("data-share");
      var url = window.location.href;
      var title = document.title;
      var href = "";
      if (network === "x") {
        href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url);
      } else if (network === "facebook") {
        href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
      } else if (network === "whatsapp") {
        href = "https://wa.me/?text=" + encodeURIComponent(title + " " + url);
      }
      if (href) {
        link.setAttribute("href", href);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    document.addEventListener("click", function (event) {
      var copy = event.target.closest("[data-copy-link]");
      if (!copy) return;
      event.preventDefault();
      var url = copy.getAttribute("data-copy-link") || window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { toast(t("common.linkCopied")); },
          function () { window.prompt(t("common.copyLink"), url); }
        );
      } else {
        window.prompt(t("common.copyLink"), url);
      }
    });
  }

  /* ------------------------------------------------------------------- forms */
  var RULES = {
    name: function (value) {
      if (!value) return "validation.nameRequired";
      if (value.length < 2) return "validation.nameShort";
      return null;
    },
    email: function (value) {
      if (!value) return "validation.emailRequired";
      if (!EMAIL_RE.test(value)) return "validation.emailInvalid";
      return null;
    },
    city: function (value) {
      if (!value) return "validation.cityRequired";
      return null;
    },
    subject: function (value) {
      if (!value) return "validation.subjectRequired";
      return null;
    },
    phone: function (value) {
      if (!value) return "validation.phoneRequired";
      var digits = value.replace(/\D/g, "");
      if (digits.length < 7) return "validation.phoneInvalid";
      return null;
    },
    message: function (value) {
      if (!value) return "validation.messageRequired";
      if (value.length < 10) return "validation.messageShort";
      return null;
    },
    consent: function (value, field) {
      if (field.type === "checkbox" && !field.checked) return "validation.consentRequired";
      return null;
    },
  };

  function fieldValue(field) {
    if (field.type === "checkbox") return field.checked ? "1" : "";
    return (field.value || "").trim();
  }

  function errorNode(field) {
    var id = field.getAttribute("id");
    if (!id) return null;
    return document.querySelector('[data-error-for="' + id + '"]');
  }

  function setFieldError(field, messageKey) {
    var error = errorNode(field);
    if (messageKey) {
      field.setAttribute("aria-invalid", "true");
      if (error) {
        error.textContent = t(messageKey);
        error.classList.add("is-visible");
      }
    } else {
      field.removeAttribute("aria-invalid");
      if (error) {
        error.textContent = "";
        error.classList.remove("is-visible");
      }
    }
  }

  function initForm(form) {
    var fields = form.querySelectorAll("[data-validate]");
    var summary = form.querySelector("[data-error-summary]") ||
      (form.parentElement ? form.parentElement.querySelector("[data-error-summary]") : null);
    var success = form.parentElement.querySelector("[data-form-success]");
    var formWrap = form;

    function validate() {
      var firstInvalid = null;
      var invalidCount = 0;
      fields.forEach(function (field) {
        var rule = field.getAttribute("data-validate");
        var checker = RULES[rule];
        var messageKey = checker ? checker(fieldValue(field), field) : null;
        setFieldError(field, messageKey);
        if (messageKey) {
          invalidCount += 1;
          if (!firstInvalid) firstInvalid = field;
        }
      });
      if (summary) {
        if (invalidCount > 0) {
          summary.textContent = t("form.errorSummary");
          summary.classList.add("is-visible");
        } else {
          summary.classList.remove("is-visible");
        }
      }
      return { ok: invalidCount === 0, firstInvalid: firstInvalid };
    }

    fields.forEach(function (field) {
      var eventName = field.tagName === "SELECT" || field.type === "checkbox" ? "change" : "blur";
      field.addEventListener(eventName, function () {
        var checker = RULES[field.getAttribute("data-validate")];
        if (!checker) return;
        if (fieldValue(field) || field.getAttribute("aria-invalid") === "true") {
          setFieldError(field, checker(fieldValue(field), field));
        }
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") {
          var checker = RULES[field.getAttribute("data-validate")];
          if (checker) setFieldError(field, checker(fieldValue(field), field));
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = validate();
      if (!result.ok) {
        if (result.firstInvalid) result.firstInvalid.focus();
        return;
      }
      if (success) {
        formWrap.hidden = true;
        success.hidden = false;
        success.classList.add("is-visible");
        var heading = success.querySelector("h3");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus();
        }
        success.scrollIntoView({ behavior: "smooth", block: "center" });
        success.dispatchEvent(new CustomEvent("demoformsuccess", { bubbles: true }));
      }
    });

    if (success) {
      var reset = success.querySelector("[data-form-reset]");
      if (reset) {
        reset.addEventListener("click", function () {
          form.reset();
          fields.forEach(function (field) { setFieldError(field, null); });
          if (summary) summary.classList.remove("is-visible");
          success.classList.remove("is-visible");
          success.hidden = true;
          formWrap.hidden = false;
          var first = form.querySelector("[data-validate]");
          if (first) first.focus();
        });
      }
    }

    // Keep any visible messages in the active language.
    document.addEventListener("languagechange", function () {
      fields.forEach(function (field) {
        if (field.getAttribute("aria-invalid") === "true") {
          var checker = RULES[field.getAttribute("data-validate")];
          if (checker) setFieldError(field, checker(fieldValue(field), field));
        }
      });
      if (summary && summary.classList.contains("is-visible")) {
        summary.textContent = t("form.errorSummary");
      }
    });
  }

  function initForms() {
    /* Forms submit directly (e.g. Web3Forms). */
  }

  /* --------------------------------------------------------------------- FAQ */
  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  function init() {
    initNavMore();
    initMobileNav();
    initYear();
    initBackToTop();
    initShare();
    initForms();
    initFaq();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
