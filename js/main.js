/* Trisha Peravai — navigation, forms, share helpers. */
(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  /* ---------------------------------------------------------------- mobile nav */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    if (!toggle || !panel) return;

    var setOpen = function (open) {
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", t(open ? "nav.closeMenu" : "nav.openMenu"));
      /* Lucide swaps <i> for <svg>, so query the current nodes each time. */
      var openLabel = toggle.querySelector(".icon-open");
      var closeLabel = toggle.querySelector(".icon-close");
      if (openLabel) openLabel.hidden = open;
      if (closeLabel) closeLabel.hidden = !open;
      if (open) {
        var first = panel.querySelector("a");
        if (first) window.setTimeout(function () { first.focus(); }, 120);
      }
    };

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("languagechange", function () {
      var open = panel.classList.contains("is-open");
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
    interest: function (value) {
      if (!value) return "validation.interestRequired";
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
