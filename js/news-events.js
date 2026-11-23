/* Trisha Peravai — news and events filtering plus detail modals. */
(function () {
  "use strict";

  function t(key, vars) {
    return window.I18N ? window.I18N.t(key, vars) : key;
  }

  /* --------------------------------------------------------------- news list */
  function initNews() {
    var grid = document.querySelector("[data-news-grid]");
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".news-card"));
    var filters = document.querySelectorAll("[data-news-filter]");
    var search = document.querySelector("[data-news-search]");
    var empty = document.querySelector("[data-news-empty]");
    var active = "all";

    function matches(card, query) {
      var categoryOk = active === "all" || card.getAttribute("data-category") === active;
      if (!categoryOk) return false;
      if (!query) return true;
      return card.textContent.toLowerCase().indexOf(query) !== -1;
    }

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card, query);
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      if (empty) empty.classList.toggle("is-visible", shown === 0);
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-news-filter") || "all";
        filters.forEach(function (other) {
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
        apply();
      });
    });

    if (search) {
      search.addEventListener("input", apply);
    }

    document.addEventListener("languagechange", apply);

    /* ------------------------------------------------------------- modal */
    var modal = document.querySelector("[data-news-modal]");
    var lastFocused = null;
    var openId = null;

    function renderModal(id) {
      if (!modal) return;
      var prefix = "news.items." + id + ".";
      var card = grid.querySelector('[data-news-id="' + id + '"]');
      var img = card ? card.querySelector("img") : null;

      var title = modal.querySelector("[data-modal-title]");
      var meta = modal.querySelector("[data-modal-meta]");
      var body = modal.querySelector("[data-modal-body]");
      var media = modal.querySelector("[data-modal-media]");
      var badge = modal.querySelector("[data-modal-badge]");

      if (title) title.textContent = t(prefix + "title");
      if (meta) meta.textContent = t(prefix + "date") + " · " + t("common.sample");
      if (body) {
        body.innerHTML = "";
        [1, 2, 3].forEach(function (n) {
          var p = document.createElement("p");
          p.textContent = t(prefix + "body" + n);
          body.appendChild(p);
        });
      }
      if (media) {
        if (img) {
          media.innerHTML = "";
          var picture = document.createElement("img");
          picture.src = img.getAttribute("data-full") || img.src;
          picture.alt = img.alt;
          picture.loading = "lazy";
          media.appendChild(picture);
          media.hidden = false;
        } else {
          media.hidden = true;
        }
      }
      if (badge) badge.textContent = t("news.featured");
    }

    function openModal(id) {
      if (!modal) return;
      openId = id;
      lastFocused = document.activeElement;
      renderModal(id);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-open");
      var closeBtn = modal.querySelector("[data-modal-close]");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-open");
      openId = null;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    grid.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-news-open]");
      if (!trigger) return;
      event.preventDefault();
      var id = trigger.getAttribute("data-news-open");
      if (id) openModal(id);
    });

    if (modal) {
      modal.querySelectorAll("[data-modal-close]").forEach(function (button) {
        button.addEventListener("click", closeModal);
      });
      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
          closeModal();
        }
      });
      document.addEventListener("languagechange", function () {
        if (openId) renderModal(openId);
      });
    }
  }

  /* ------------------------------------------------------------- events list */
  function initEvents() {
    var list = document.querySelector("[data-events-list]");
    if (!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll(".event-card"));
    var filters = document.querySelectorAll("[data-event-filter]");
    var empty = document.querySelector("[data-events-empty]");
    var active = "all";

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = active === "all" || card.getAttribute("data-category") === active;
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      if (empty) empty.classList.toggle("is-visible", shown === 0);
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-event-filter") || "all";
        filters.forEach(function (other) {
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
        apply();
      });
    });

    /* ------------------------------------------------------------- modal */
    var modal = document.querySelector("[data-event-modal]");
    var lastFocused = null;
    var openId = null;

    function renderModal(id) {
      if (!modal) return;
      var prefix = "events.items." + id + ".";
      var title = modal.querySelector("[data-modal-title]");
      var meta = modal.querySelector("[data-modal-meta]");
      var body = modal.querySelector("[data-modal-body]");
      var facts = modal.querySelector("[data-modal-facts]");

      if (title) title.textContent = t(prefix + "title");
      if (meta) meta.textContent = t(prefix + "date") + " · " + t("common.sample");
      if (body) {
        body.innerHTML = "";
        [1, 2, 3].forEach(function (n) {
          var p = document.createElement("p");
          p.textContent = t(prefix + "body" + n);
          body.appendChild(p);
        });
      }
      if (facts) {
        facts.innerHTML = "";
        [
          ["events.dateLabel", t(prefix + "date")],
          ["events.timeLabel", t(prefix + "time")],
          ["events.venueLabel", t(prefix + "location")],
        ].forEach(function (pair) {
          var row = document.createElement("div");
          var dt = document.createElement("span");
          dt.className = "label";
          dt.textContent = t(pair[0]);
          var dd = document.createElement("span");
          dd.className = "value";
          dd.textContent = pair[1];
          row.appendChild(dt);
          row.appendChild(dd);
          facts.appendChild(row);
        });
      }
    }

    function openModal(id) {
      if (!modal) return;
      openId = id;
      lastFocused = document.activeElement;
      renderModal(id);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-open");
      var closeBtn = modal.querySelector("[data-modal-close]");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-open");
      openId = null;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    list.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-event-open]");
      if (!trigger) return;
      event.preventDefault();
      var id = trigger.getAttribute("data-event-open");
      if (id) openModal(id);
    });

    if (modal) {
      modal.querySelectorAll("[data-modal-close]").forEach(function (button) {
        button.addEventListener("click", closeModal);
      });
      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeModal();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
          closeModal();
        }
      });
      document.addEventListener("languagechange", function () {
        if (openId) renderModal(openId);
      });
    }
  }

  function init() {
    initNews();
    initEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
