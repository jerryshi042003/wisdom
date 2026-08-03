(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/wisdom/demo/people-library/sw.js", {
      scope: "/wisdom/demo/people-library/"
    }).catch(function () {
      // The page remains a complete online demo if registration is unavailable.
    });
  });
})();
