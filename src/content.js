/**
 * T3 Chat Input Toggle
 * Adds a collapse/expand button to the input box on t3.chat
 */
(function () {
  "use strict";

  const STORAGE_KEY = "t3-chat-input-collapsed";
  const DURATION = 300;

  let stylesInjected = false;
  let floatingButton = null;
  let observer = null;
  let isAnimating = false;

  function getChatInputForm() {
    return document.querySelector("#chat-input-form");
  }

  function getInputContainer() {
    const form = getChatInputForm();
    if (!form) return null;
    return form.closest("div.pointer-events-auto");
  }

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  function setCollapsed(value) {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }

  const ICON_DOWN = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  const ICON_UP = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';

  function ensureFloatingButton() {
    if (!floatingButton || !document.body.contains(floatingButton)) {
      floatingButton = document.createElement("button");
      floatingButton.className = "t3-toggle-floating";
      floatingButton.type = "button";
      floatingButton.setAttribute("aria-label", "Toggle input box");
      document.body.appendChild(floatingButton);
    }
    return floatingButton;
  }

  function ensureWrapper(container) {
    const WRAPPER_CLASS = "t3-toggle-wrapper";
    let wrapper = container.parentElement;
    if (!wrapper || !wrapper.classList.contains(WRAPPER_CLASS)) {
      wrapper = document.createElement("div");
      wrapper.className = WRAPPER_CLASS;
      container.parentElement.insertBefore(wrapper, container);
      wrapper.appendChild(container);
    }
    return wrapper;
  }

  function ensureOverlay(wrapper) {
    const OVERLAY_CLASS = "t3-toggle-overlay";
    let overlay = wrapper.querySelector("." + OVERLAY_CLASS);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = OVERLAY_CLASS;
      wrapper.appendChild(overlay);
    }
    return overlay;
  }

  function applyState(collapsed) {
    const container = getInputContainer();
    const btn = ensureFloatingButton();

    if (!container) return;

    const wrapper = ensureWrapper(container);
    const overlay = ensureOverlay(wrapper);

    if (collapsed) {
      const containerHeight = container.offsetHeight;
      wrapper.style.overflow = "hidden";
      wrapper.style.height = containerHeight + "px";
      wrapper.style.pointerEvents = "none";
      overlay.style.display = "block";
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)";
      isAnimating = true;

      // Trigger transition on next frame
      requestAnimationFrame(() => {
        wrapper.style.height = "0px";
        overlay.style.opacity = "1";
      });

      // Hide after transition
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

      // Trigger transition on next frame
      requestAnimationFrame(() => {
        wrapper.style.height = targetHeight + "px";
        overlay.style.opacity = "0";
      });

      // Clean up after transition
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

  function createInlineButton(form) {
    if (!form) return;
    if (form.querySelector(".t3-toggle-inline")) return;

    const btn = document.createElement("button");
    btn.className = "t3-toggle-inline";
    btn.type = "button";
    btn.title = "Collapse input";
    btn.setAttribute("aria-label", "Toggle input box");
    btn.innerHTML = ICON_DOWN;
    form.appendChild(btn);
  }

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement("style");
    style.id = "t3-toggle-styles";
    style.textContent = `
      .t3-toggle-wrapper {
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
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
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.3s, opacity 0.3s;
        opacity: 0;
        transform: scale(0.8);
      }
      .t3-toggle-floating:hover {
        background: var(--accent) !important;
        color: var(--foreground) !important;
        border-color: var(--input) !important;
        transform: scale(1.1) !important;
      }
      .t3-toggle-floating:active {
        transform: scale(0.95) !important;
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
        color: var(--foreground);
        background: var(--muted);
        transform: scale(1.1);
      }
      .t3-toggle-inline:active {
        transform: scale(0.95);
      }
      .t3-toggle-inline svg {
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .t3-toggle-inline svg:hover {
        transform: rotate(15deg);
      }
    `;
    document.head.appendChild(style);
  }

  function handleToggleClick(e) {
    const button = e.target.closest(".t3-toggle-floating, .t3-toggle-inline");
    if (!button) return;

    if (isAnimating) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const newState = !isCollapsed();
    setCollapsed(newState);
    applyState(newState);
  }

  function setupObserver() {
    if (observer) return;

    let reconnectTimer = null;

    observer = new MutationObserver(() => {
      const form = getChatInputForm();
      if (form) {
        if (!form.querySelector(".t3-toggle-inline")) {
          observer.disconnect();
          createInlineButton(form);
          applyState(isCollapsed());
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            if (observer) {
              observer.observe(document.body, {
                childList: true,
                subtree: true,
              });
            }
          }, 500);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    injectStyles();
    ensureFloatingButton();

    const form = getChatInputForm();
    if (form) {
      createInlineButton(form);
    }

    applyState(isCollapsed());
    setupObserver();
  }

  document.addEventListener("click", handleToggleClick, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
