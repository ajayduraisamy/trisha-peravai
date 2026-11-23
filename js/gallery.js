/* Trisha Peravai — gallery filtering and accessible lightbox. */
(function () {
  "use strict";

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  function init() {
    var grid = document.querySelector("[data-gallery-grid]");
    if (!grid) return;

    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery-item"));
    var filterButtons = document.querySelectorAll("[data-filter]");
    var countNode = document.querySelector("[data-gallery-count]");
    var emptyState = document.querySelector("[data-gallery-empty]");
    var lightbox = document.querySelector("[data-lightbox]");
    var activeFilter = "all";
    var visibleItems = items.slice();
    var current = -1;
    var lastFocused = null;

    function updateCount() {
      if (!countNode) return;
      var template = activeFilter === "all" ? "gallery.count" : "gallery.countFiltered";
      countNode.textContent = t(template, { n: visibleItems.length });
    }

    function applyFilter(filter) {
      activeFilter = filter;
      visibleItems = [];
      items.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        item.hidden = !match;
        if (match) visibleItems.push(item);
      });
      filterButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-filter") === filter ? "true" : "false");
      });
      if (emptyState) emptyState.classList.toggle("is-visible", visibleItems.length === 0);
      if (current >= 0) closeLightbox();
      updateCount();
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-filter") || "all");
      });
    });

    /* ------------------------------------------------------------- lightbox */
    var stageImage = lightbox ? lightbox.querySelector("[data-lightbox-image]") : null;
    var titleNode = lightbox ? lightbox.querySelector("[data-lightbox-title]") : null;
    var creditNode = lightbox ? lightbox.querySelector("[data-lightbox-credit]") : null;
    var licenseNode = lightbox ? lightbox.querySelector("[data-lightbox-license]") : null;
    var sourceLink = lightbox ? lightbox.querySelector("[data-lightbox-source]") : null;
    var counterNode = lightbox ? lightbox.querySelector("[data-lightbox-counter]") : null;

    function openLightbox(item) {
      if (!lightbox) return;
      lastFocused = document.activeElement;
      current = visibleItems.indexOf(item);
      render();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-open");
      var closeBtn = lightbox.querySelector("[data-lightbox-close]");
      if (closeBtn) closeBtn.focus();
    }

    function render() {
      var item = visibleItems[current];
      if (!item) return;
      var img = item.querySelector("img");
      var full = item.getAttribute("data-src") || (img ? img.currentSrc || img.src : "");

      if (stageImage) {
        stageImage.src = full;
        stageImage.alt = img ? img.alt : "";
      }
      if (titleNode) {
        var titleEl = item.querySelector(".gallery-item__title");
        titleNode.textContent = titleEl ? titleEl.textContent : "";
      }
      if (creditNode) creditNode.textContent = item.getAttribute("data-credit") || "—";
      if (licenseNode) licenseNode.textContent = item.getAttribute("data-license") || "—";
      if (sourceLink) {
        sourceLink.href = item.getAttribute("data-source") || "#";
        if (!item.getAttribute("data-source")) sourceLink.hidden = true;
      }
      if (counterNode) {
        counterNode.textContent = t("gallery.lightbox.counter", {
          current: current + 1,
          total: visibleItems.length,
        });
      }
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-open");
      current = -1;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function step(delta) {
      if (!visibleItems.length) return;
      current = (current + delta + visibleItems.length) % visibleItems.length;
      render();
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () { openLightbox(item); });
    });

    if (lightbox) {
      lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (button) {
        button.addEventListener("click", closeLightbox);
      });
      var prev = lightbox.querySelector("[data-lightbox-prev]");
      var next = lightbox.querySelector("[data-lightbox-next]");
      if (prev) prev.addEventListener("click", function () { step(-1); });
      if (next) next.addEventListener("click", function () { step(1); });
      lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) closeLightbox();
      });

      document.addEventListener("keydown", function (event) {
        if (!lightbox.classList.contains("is-open")) return;
        if (event.key === "Escape") {
          event.preventDefault();
          closeLightbox();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          step(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          step(1);
        } else if (event.key === "Tab") {
          var focusables = lightbox.querySelectorAll("button, a[href]");
          if (!focusables.length) return;
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
    }

    document.addEventListener("languagechange", function () {
      updateCount();
      if (lightbox && lightbox.classList.contains("is-open")) render();
    });

    applyFilter("all");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
