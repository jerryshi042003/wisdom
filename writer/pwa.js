"use strict";

// Install prompt and update banner. Kept out of app.js so the editor has no
// service-worker code in it.

const installButton = document.querySelector("#installButton");
const installDialog = document.querySelector("#installDialog");
const updateBanner = document.querySelector("#updateBanner");
const activateUpdate = document.querySelector("#activateUpdate");
let deferredInstallPrompt = null;
let waitingWorker = null;

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function manualAppleInstall() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function openInstallInstructions() {
  if (typeof installDialog.showModal === "function") installDialog.showModal();
  else installDialog.setAttribute("open", "");
}

function closeInstallInstructions() {
  if (typeof installDialog.close === "function") installDialog.close();
  else installDialog.removeAttribute("open");
}

if (manualAppleInstall() && !standalone()) installButton.hidden = false;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!standalone()) installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    openInstallInstructions();
    return;
  }
  await deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

installDialog.querySelector("[data-install-close]").addEventListener("click", closeInstallInstructions);
installDialog.addEventListener("click", (event) => {
  if (event.target === installDialog) closeInstallInstructions();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

activateUpdate.addEventListener("click", () => {
  if (!waitingWorker) return;
  sessionStorage.setItem("quiet.reloadAfterUpdate", "yes");
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
  activateUpdate.disabled = true;
  activateUpdate.textContent = "Updating…";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js", { scope: "./", updateViaCache: "none" });

      const showWaiting = (worker) => {
        waitingWorker = worker;
        updateBanner.hidden = false;
      };

      if (registration.waiting && navigator.serviceWorker.controller) showWaiting(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) showWaiting(installing);
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (sessionStorage.getItem("quiet.reloadAfterUpdate") !== "yes") return;
        sessionStorage.removeItem("quiet.reloadAfterUpdate");
        location.reload();
      });
    } catch {
      // Online use is unaffected; only offline opening is lost.
    }
  });
}
