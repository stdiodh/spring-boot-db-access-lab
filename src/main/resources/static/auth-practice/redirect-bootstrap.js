"use strict";

(() => {
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const page = window.location.pathname.split("/").pop();
  let payload = null;

  if (page === "oauth.html") {
    payload = {
      oauth: query.get("oauth"),
      provider: query.get("provider"),
      isNewUser: query.get("isNewUser"),
      access_token: fragment.get("access_token")
    };
  } else if (page === "recovery.html") {
    payload = {
      reset_token: fragment.get("reset_token")
    };
  }

  if (payload === null) {
    return;
  }

  const wasScrubbed = window.location.search !== "" || window.location.hash !== "";
  if (wasScrubbed) {
    window.history.replaceState(null, document.title, window.location.pathname);
  }

  Object.defineProperty(window, "__authPracticeRedirect", {
    configurable: true,
    value: Object.freeze({ ...payload, wasScrubbed })
  });
})();
