(function () {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const isiOS =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

  document.documentElement.classList.toggle("is-standalone", standalone);
  document.documentElement.classList.toggle("is-ios", isiOS);

  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const localTestEnabled = new URLSearchParams(window.location.search).get("sw-test") === "1";
  if (localHosts.has(window.location.hostname) && !localTestEnabled) return;
  if (!("serviceWorker" in navigator)) return;

  let hadController = Boolean(navigator.serviceWorker.controller);
  let announcedWorker = null;
  let updateRequested = false;
  let refreshing = false;

  function showUpdateNotice(registration, worker) {
    if (document.getElementById("wisdom-update-notice")) return;

    const notice = document.createElement("div");
    notice.id = "wisdom-update-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    Object.assign(notice.style, {
      position: "fixed",
      zIndex: "1000",
      left: "max(12px, env(safe-area-inset-left))",
      right: "max(12px, env(safe-area-inset-right))",
      bottom: "max(12px, env(safe-area-inset-bottom))",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "12px 14px",
      border: "1px solid #263238",
      borderRadius: "12px",
      background: "#fffdf7",
      color: "#172126",
      boxShadow: "0 10px 32px rgba(20, 31, 37, 0.22)",
      font: "600 15px/1.35 system-ui, sans-serif"
    });

    const label = document.createElement("span");
    label.textContent = "A fresh Wisdom home is ready.";
    const apply = document.createElement("button");
    apply.type = "button";
    apply.textContent = "Update Wisdom";
    Object.assign(apply.style, {
      minHeight: "44px",
      padding: "8px 14px",
      border: "1px solid currentColor",
      borderRadius: "999px",
      background: "#172126",
      color: "white",
      font: "inherit",
      cursor: "pointer"
    });
    apply.addEventListener("click", () => {
      updateRequested = true;
      apply.disabled = true;
      apply.textContent = "Updating…";
      const waiting = registration.waiting || worker;
      if (waiting?.postMessage) {
        waiting.postMessage({type: "APPLY_WISDOM_UPDATE"});
      } else {
        window.location.reload();
      }
    });

    notice.append(label, apply);
    document.body.append(notice);
  }

  function announceUpdate(registration, worker) {
    if (!worker || announcedWorker === worker) return;
    announcedWorker = worker;
    const event = new CustomEvent("wisdom-update-ready", {
      cancelable: true,
      detail: {
        registration,
        worker,
        applyUpdate() {
          updateRequested = true;
          (registration.waiting || worker).postMessage({type: "APPLY_WISDOM_UPDATE"});
        }
      }
    });
    if (window.dispatchEvent(event)) showUpdateNotice(registration, worker);
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // The first-ever install may claim this open page; it does not need a
    // disruptive reload. A replacement controller does.
    if (!hadController && !updateRequested) {
      hadController = true;
      return;
    }
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/wisdom/sw.js")
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          announceUpdate(registration, registration.waiting);
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              announceUpdate(registration, registration.waiting || installing);
            }
          });
        });
        if (navigator.onLine) registration.update();
      })
      .catch((error) => {
        console.debug("Wisdom reader service worker registration failed", error);
      });
  });
})();
