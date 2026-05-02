/**
 * T3 Chat Input Toggle
 * Adds a collapse/expand button to the input box on t3.chat
 */
(function () {
  "use strict";

  const STORAGE_KEY = "t3-chat-input-collapsed";
  const DURATION = 300;

  let isAnimating = false;

  // --- SVG icons ---

  const ICON_DOWN =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  const ICON_UP =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';

  // --- DOM helpers ---

  function getForm() {
    return document.querySelector("#chat-input-form");
  }

  function getContainer() {
    return getForm()?.closest("div.pointer-events-auto");
  }

  function createElement(tag, className, parent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (parent) parent.appendChild(el);
    return el;
  }

  // --- State ---

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  function setCollapsed(value) {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }

  // --- Floating button (visible when collapsed) ---

  function getFloatingButton() {
    let btn = document.querySelector(".t3-toggle-floating");
    if (!btn || !document.body.contains(btn)) {
      btn = createElement("button", "t3-toggle-floating", document.body);
      btn.type = "button";
      btn.setAttribute("aria-label", "Toggle input box");
    }
    return btn;
  }

  // --- Inline button (visible when expanded) ---

  function createInlineButton(form) {
    if (form.querySelector(".t3-toggle-inline")) return;

    const btn = createElement("button", "t3-toggle-inline", form);
    btn.type = "button";
    btn.title = "Collapse input";
    btn.setAttribute("aria-label", "Toggle input box");
    btn.innerHTML = ICON_DOWN;
  }

  // --- Wrapper + overlay ---

  function getOrCreateWrapper(container) {
    let wrapper = container.closest(".t3-toggle-wrapper");
    if (!wrapper) {
      wrapper = createElement("div", "t3-toggle-wrapper", container.parentElement);
      wrapper.appendChild(container);
    }
    return wrapper;
  }

  function getOrCreateOverlay(wrapper) {
    return wrapper.querySelector(".t3-toggle-overlay") || createElement("div", "t3-toggle-overlay", wrapper);
  }

  // --- Animation ---

  function applyState(collapsed) {
    const container = getContainer();
    if (!container) return;

    const btn = getFloatingButton();
    const wrapper = getOrCreateWrapper(container);
    const overlay = getOrCreateOverlay(wrapper);

    if (collapsed) {
      const height = container.offsetHeight;

      wrapper.style.overflow = "hidden";
      wrapper.style.height = `${height}px`;
      wrapper.style.pointerEvents = "none";
      overlay.style.display = "block";
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)";
      isAnimating = true;

      requestAnimationFrame(() => {
        wrapper.style.height = "0px";
        overlay.style.opacity = "1";
      });

      setTimeout(() => {
        wrapper.style.display = "none";
        isAnimating = false;
      }, DURATION);

      btn.style.display = "flex";
      btn.innerHTML = ICON_UP;
      btn.title = "Expand input";
      requestAnimationFrame(() => {
        btn.style.opacity = "1";
        btn.style.transform = "scale(1)";
      });
    } else {
      wrapper.style.display = "";
      wrapper.style.overflow = "hidden";
      wrapper.style.height = "0px";
      wrapper.style.pointerEvents = "none";
      overlay.style.display = "block";
      overlay.style.opacity = "1";
      overlay.style.transition = "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)";
      isAnimating = true;

      const targetHeight = container.offsetHeight;

      requestAnimationFrame(() => {
        wrapper.style.height = `${targetHeight}px`;
        overlay.style.opacity = "0";
      });

      setTimeout(() => {
        wrapper.style.overflow = "";
        wrapper.style.height = "";
        overlay.style.display = "none";
        wrapper.style.pointerEvents = "";
        isAnimating = false;
      }, DURATION);

      btn.style.opacity = "0";
      btn.style.transform = "scale(0.8)";
      btn.title = "Collapse input";
      setTimeout(() => {
        btn.style.display = "none";
      }, DURATION);
    }
  }

  // --- Click handler ---

  function handleClick(e) {
    const button = e.target.closest(".t3-toggle-floating, .t3-toggle-inline");
    if (!button || isAnimating) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const newState = !isCollapsed();
    setCollapsed(newState);
    applyState(newState);
  }

  // --- MutationObserver (re-inject button on React re-renders) ---

  function setupObserver() {
    let timer = null;

    const observer = new MutationObserver(() => {
      const form = getForm();
      if (!form || form.querySelector(".t3-toggle-inline")) return;

      observer.disconnect();
      createInlineButton(form);
      applyState(isCollapsed());

      clearTimeout(timer);
      timer = setTimeout(() => {
        observer.observe(document.body, { childList: true, subtree: true });
      }, 500);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- Styles ---

  function injectStyles() {
    if (document.getElementById("t3-toggle-styles")) return;

    const style = createElement("style", null, document.head);
    style.id = "t3-toggle-styles";
    style.textContent = `
      .t3-toggle-wrapper {
        position: relative;
        transition: height ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .t3-toggle-overlay {
        display: none;
        position: absolute;
        inset: 0;
        z-index: 1;
        background: var(--chat-background);
        pointer-events: none;
        border-radius: 20px 20px 0 0;
      }
      .t3-toggle-floating {
        display: none;
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 2147483647;
        width: 32px;
        height: 32px;
        background: var(--muted);
        border: 1px solid var(--border);
        color: var(--foreground);
        cursor: pointer;
        padding: 0;
        border-radius: 6px;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.3s, opacity 0.3s;
        opacity: 0;
        transform: scale(0.8);
      }
      .t3-toggle-floating:hover {
        background: var(--accent);
        color: var(--foreground);
        border-color: var(--input);
        transform: scale(1.1);
      }
      .t3-toggle-floating:active {
        transform: scale(0.95);
      }
      .t3-toggle-inline {
        position: absolute;
        top: 6px;
        right: 10px;
        z-index: 9999;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        color: var(--foreground);
        cursor: pointer;
        padding: 0;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s, background 0.15s, transform 0.2s;
      }
      .t3-toggle-inline:hover {
        background: var(--muted);
        transform: scale(1.1);
      }
      .t3-toggle-inline:active {
        transform: scale(0.95);
      }
      .t3-toggle-inline svg {
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .t3-toggle-inline:hover svg {
        transform: rotate(15deg);
      }
    `;
  }

  // --- Init ---

  function init() {
    injectStyles();
    getFloatingButton();

    const form = getForm();
    if (form) createInlineButton(form);

    applyState(isCollapsed());
    setupObserver();
  }

  document.addEventListener("click", handleClick, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
