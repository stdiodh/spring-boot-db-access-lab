"use strict";

let landingOAuthPayload = { ...(window.__authPracticeRedirect || { wasScrubbed: false }) };
delete window.__authPracticeRedirect;

const api = {
  me: "/auth/me",
  localPassword: "/auth/local-password"
};

const elements = {
  traceList: document.querySelector("#traceList"),
  secretAirlock: document.querySelector("#secretAirlock"),
  urlScrubState: document.querySelector("#urlScrubState"),
  urlScrubNotice: document.querySelector("#urlScrubNotice"),
  googleLoginLink: document.querySelector("#googleLoginLink"),
  oauthNotice: document.querySelector("#oauthNotice"),
  oauthError: document.querySelector("#oauthError"),
  oauthReceipt: document.querySelector("#oauthReceipt"),
  receiptStatus: document.querySelector("#receiptStatus"),
  providerValue: document.querySelector("#providerValue"),
  accountStatus: document.querySelector("#accountStatus"),
  internalEmail: document.querySelector("#internalEmail"),
  jwtStatus: document.querySelector("#jwtStatus"),
  loginMethodsValue: document.querySelector("#loginMethodsValue"),
  verifyButton: document.querySelector("#verifyButton"),
  clearButton: document.querySelector("#clearButton"),
  tokenLab: document.querySelector("#tokenLab"),
  fullToken: document.querySelector("#fullToken"),
  copyTokenButton: document.querySelector("#copyTokenButton"),
  copyStatus: document.querySelector("#copyStatus"),
  identityProof: document.querySelector("#identityProof"),
  identityTitle: document.querySelector("#identity-title"),
  identityDescription: document.querySelector("#identityDescription"),
  identityStatus: document.querySelector("#identityStatus"),
  localPasswordPanel: document.querySelector("#localPasswordPanel"),
  localPasswordTitle: document.querySelector("#local-password-title"),
  localPasswordState: document.querySelector("#localPasswordState"),
  localPasswordForm: document.querySelector("#localPasswordForm"),
  localPassword: document.querySelector("#localPassword"),
  localPasswordConfirm: document.querySelector("#localPasswordConfirm"),
  localPasswordError: document.querySelector("#localPasswordError"),
  localPasswordConfirmError: document.querySelector("#localPasswordConfirmError"),
  localPasswordButton: document.querySelector("#localPasswordButton"),
  skipLocalPasswordButton: document.querySelector("#skipLocalPasswordButton"),
  localPasswordNotice: document.querySelector("#localPasswordNotice"),
  localPasswordRequestError: document.querySelector("#localPasswordRequestError"),
  localLoginLink: document.querySelector("#localLoginLink")
};

const stages = {
  google: document.querySelector('[data-stage="google"]'),
  account: document.querySelector('[data-stage="account"]'),
  principal: document.querySelector('[data-stage="principal"]'),
  credential: document.querySelector('[data-stage="credential"]')
};

const evidence = window.authPractice.createHttpEvidence();
let authSession = null;
let busy = false;
let currentLoginMethods = [];
let localPasswordConfigured = false;
let localPasswordSkipped = false;
let receiptActiveStatus = "내부 계정 확인 중";
let receiptSuccessStatus = "내부 계정 확인 완료";
let receiptSuccessNotice = "Google 신원을 내부 계정에 연결했고 /auth/me가 로그인 ID를 확인했습니다.";

function setStage(name, state, label) {
  const stage = stages[name];
  stage.dataset.state = state;
  stage.querySelector("[data-stage-label]").textContent = label;
}

function setProgress(value) {
  elements.traceList.style.setProperty("--progress", String(value / 3));
}

function setNotice(message, tone = "default") {
  window.authPractice.setNotice(elements.oauthNotice, message, tone);
}

function setLocalPasswordNotice(message, tone = "default") {
  window.authPractice.setNotice(elements.localPasswordNotice, message, tone);
}

function showError(message) {
  elements.oauthError.textContent = message;
  elements.oauthError.hidden = false;
}

function clearError() {
  elements.oauthError.textContent = "";
  elements.oauthError.hidden = true;
}

function setBusy(isBusy) {
  busy = isBusy;
  const canConfigureLocalPassword =
    authSession !== null &&
    !localPasswordConfigured &&
    !localPasswordSkipped &&
    !elements.localPasswordForm.hidden;

  elements.googleLoginLink.setAttribute("aria-disabled", String(isBusy));
  elements.verifyButton.disabled = isBusy || authSession === null;
  elements.clearButton.disabled = isBusy || authSession === null;
  elements.copyTokenButton.disabled = isBusy || authSession === null;
  elements.localPasswordForm.setAttribute("aria-busy", String(isBusy));
  elements.localPassword.disabled = isBusy || !canConfigureLocalPassword;
  elements.localPasswordConfirm.disabled = isBusy || !canConfigureLocalPassword;
  elements.localPasswordButton.disabled = isBusy || !canConfigureLocalPassword;
  elements.skipLocalPasswordButton.disabled = isBusy || !canConfigureLocalPassword;
}

function markAirlockScrubbed() {
  elements.secretAirlock.dataset.state = "scrubbed";
  elements.urlScrubState.textContent = "URL 정리 완료";
  elements.urlScrubNotice.textContent =
    "OAuth 공개 상태와 access token을 메모리로 회수하고 query·fragment를 현재 history entry에서 제거했습니다.";
}

function setReceipt(state, status) {
  elements.oauthReceipt.dataset.state = state;
  elements.receiptStatus.textContent = status;
}

function normalizeLoginMethods(value) {
  if (!Array.isArray(value)) {
    return null;
  }

  return [...new Set(
    value
      .filter((method) => typeof method === "string")
      .map((method) => method.trim().toUpperCase())
      .filter((method) => ["GOOGLE", "LOCAL"].includes(method))
  )];
}

function formatLoginMethods(methods) {
  return ["GOOGLE", "LOCAL"]
    .filter((method) => methods.includes(method))
    .join(" + ");
}

function clearLocalPasswordFields() {
  elements.localPassword.value = "";
  elements.localPasswordConfirm.value = "";
}

function clearLocalPasswordErrors() {
  for (const [input, error] of [
    [elements.localPassword, elements.localPasswordError],
    [elements.localPasswordConfirm, elements.localPasswordConfirmError]
  ]) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }

  elements.localPasswordRequestError.textContent = "";
  elements.localPasswordRequestError.hidden = true;
}

function focusLocalPasswordPanel() {
  window.requestAnimationFrame(() => {
    elements.localPasswordPanel.scrollIntoView({ block: "start" });
    elements.localPasswordTitle.focus({ preventScroll: true });
  });
}

function hideLocalPasswordPanel() {
  currentLoginMethods = [];
  localPasswordConfigured = false;
  localPasswordSkipped = false;
  clearLocalPasswordFields();
  clearLocalPasswordErrors();
  elements.localPasswordPanel.hidden = true;
  elements.localPasswordPanel.dataset.state = "waiting";
  elements.localPasswordForm.hidden = true;
  elements.localLoginLink.hidden = true;
  elements.localPasswordTitle.textContent = "자체 로그인 비밀번호를 추가할 수 있습니다.";
  elements.localPasswordState.textContent = "LOCAL 미설정";
  setLocalPasswordNotice(
    "비밀번호 원문은 응답 증거, URL, 브라우저 저장소에 남기지 않습니다."
  );
  setBusy(busy);
}

function showLocalPasswordSetup(shouldFocus) {
  localPasswordConfigured = false;
  localPasswordSkipped = false;
  clearLocalPasswordErrors();
  elements.localPasswordPanel.hidden = false;
  elements.localPasswordPanel.dataset.state = "active";
  elements.localPasswordForm.hidden = false;
  elements.localLoginLink.hidden = true;
  elements.localPasswordTitle.textContent = "자체 로그인 비밀번호를 추가할 수 있습니다.";
  elements.localPasswordState.textContent = "LOCAL 미설정";
  elements.loginMethodsValue.textContent = "GOOGLE";
  setStage("credential", "active", "새 LOCAL 비밀번호 선택");
  setReceipt("success", `${receiptSuccessStatus} · LOCAL 선택 가능`);
  setLocalPasswordNotice(
    "Google 로그인은 이미 사용할 수 있습니다. 새 비밀번호를 설정하면 자체 로그인도 함께 사용할 수 있습니다.",
    "notice"
  );
  setNotice(
    receiptSuccessNotice + " LOCAL 비밀번호는 선택해서 추가할 수 있습니다.",
    "success"
  );
  setBusy(busy);

  if (shouldFocus) {
    focusLocalPasswordPanel();
  }
}

function showLocalPasswordConfigured(shouldFocus) {
  currentLoginMethods = ["GOOGLE", "LOCAL"];
  localPasswordConfigured = true;
  localPasswordSkipped = false;
  clearLocalPasswordFields();
  clearLocalPasswordErrors();
  elements.localPasswordPanel.hidden = false;
  elements.localPasswordPanel.dataset.state = "success";
  elements.localPasswordForm.hidden = true;
  elements.localLoginLink.hidden = false;
  elements.localPasswordTitle.textContent = "자체 로그인 비밀번호 설정을 완료했습니다.";
  elements.localPasswordState.textContent = "GOOGLE + LOCAL";
  elements.loginMethodsValue.textContent = "GOOGLE + LOCAL";
  setStage("credential", "success", "GOOGLE + LOCAL 사용 가능");
  setProgress(3);
  setReceipt("success", `${receiptSuccessStatus} · LOCAL 사용 가능`);
  setLocalPasswordNotice(
    "Google 로그인과 자체 로그인을 모두 사용할 수 있습니다. 비밀번호 원문은 이 페이지에 남기지 않았습니다.",
    "success"
  );
  setNotice(
    receiptSuccessNotice + " 자체 로그인 수단도 사용할 수 있습니다.",
    "success"
  );
  setBusy(busy);

  if (shouldFocus) {
    focusLocalPasswordPanel();
  }
}

function skipLocalPasswordSetup() {
  localPasswordConfigured = false;
  localPasswordSkipped = true;
  clearLocalPasswordFields();
  clearLocalPasswordErrors();
  elements.localPasswordPanel.dataset.state = "notice";
  elements.localPasswordForm.hidden = true;
  elements.localLoginLink.hidden = true;
  elements.localPasswordTitle.textContent = "LOCAL 비밀번호 설정을 건너뛰었습니다.";
  elements.localPasswordState.textContent = "GOOGLE 로그인 유지";
  elements.loginMethodsValue.textContent = "GOOGLE";
  setStage("credential", "notice", "이번에는 건너뜀 · Google 사용 가능");
  setReceipt("success", `${receiptSuccessStatus} · Google 로그인 유지`);
  setLocalPasswordNotice(
    "계정은 그대로 사용할 수 있습니다. 다음 Google 로그인 뒤 LOCAL 비밀번호를 다시 선택할 수 있습니다.",
    "notice"
  );
  setNotice(
    receiptSuccessNotice + " 이번에는 Google 로그인만 유지합니다.",
    "success"
  );
  setBusy(false);
}

function requireGoogleReauthentication() {
  authSession = null;
  currentLoginMethods = [];
  localPasswordConfigured = false;
  localPasswordSkipped = false;
  clearTokenReceipt();
  clearLocalPasswordFields();
  clearLocalPasswordErrors();
  elements.localPasswordPanel.hidden = false;
  elements.localPasswordPanel.dataset.state = "error";
  elements.localPasswordForm.hidden = true;
  elements.localLoginLink.hidden = true;
  elements.localPasswordTitle.textContent = "Google 로그인이 다시 필요합니다.";
  elements.localPasswordState.textContent = "401 재인증";
  elements.loginMethodsValue.textContent = "재확인 필요";
  elements.jwtStatus.textContent = "401 재인증 필요";
  setStage("principal", "error", "401 JWT 확인 실패");
  setStage("credential", "error", "LOCAL 등록 중단");
  setProgress(2);
  setReceipt("error", "Google 재로그인 필요");
  showIdentityError("우리 JWT가 더 이상 유효하지 않아 로그인 방식과 LOCAL 자격을 변경할 수 없습니다.");
  setLocalPasswordNotice(
    "위의 Google로 계속하기 버튼으로 다시 로그인한 뒤 비밀번호 설정을 이어가세요.",
    "error"
  );
  showError("인증이 만료되었습니다. Google 로그인을 다시 진행하세요.");
  setBusy(false);
}

function validateLocalPassword() {
  clearLocalPasswordErrors();
  const password = elements.localPassword.value;
  let valid = true;

  if (password.length < 8 || password.length > 64 || password.trim().length === 0) {
    elements.localPassword.setAttribute("aria-invalid", "true");
    elements.localPasswordError.textContent =
      "새 LOCAL 비밀번호는 공백만으로 구성하지 않은 8~64자여야 합니다.";
    valid = false;
  }

  if (elements.localPasswordConfirm.value !== password) {
    elements.localPasswordConfirm.setAttribute("aria-invalid", "true");
    elements.localPasswordConfirmError.textContent = "새 비밀번호와 확인 값이 같아야 합니다.";
    valid = false;
  }

  if (!valid) {
    (elements.localPassword.hasAttribute("aria-invalid")
      ? elements.localPassword
      : elements.localPasswordConfirm).focus();
  }

  return valid;
}

function resetIdentity() {
  elements.identityProof.dataset.state = "waiting";
  elements.identityTitle.textContent = "아직 내부 로그인 ID를 확인하지 않았습니다.";
  elements.identityDescription.textContent =
    "OAuth 성공 뒤 우리 JWT로 GET /auth/me를 호출해야 내부 계정의 email을 확정할 수 있습니다.";
  elements.identityStatus.textContent = "확인 전";
}

function showIdentity(email) {
  elements.identityProof.dataset.state = "success";
  elements.identityTitle.textContent = `내부 로그인 ID는 ${email}입니다.`;
  elements.identityDescription.textContent =
    "Google callback metadata가 아니라 우리 JWT를 검증한 /auth/me 응답으로 내부 신원을 확정했습니다.";
  elements.identityStatus.textContent = "내부 신원 확인";
}

function showIdentityError(message) {
  elements.identityProof.dataset.state = "error";
  elements.identityTitle.textContent = "내부 로그인 ID를 확인하지 못했습니다.";
  elements.identityDescription.textContent = message;
  elements.identityStatus.textContent = "확인 실패";
}

function clearTokenReceipt() {
  elements.tokenLab.hidden = true;
  elements.fullToken.value = "";
  elements.copyTokenButton.textContent = "Access Token 복사";
  elements.copyStatus.textContent = "token은 브라우저 메모리에만 있습니다.";
}

function showTokenReceipt() {
  if (!authSession) {
    clearTokenReceipt();
    return;
  }

  elements.fullToken.value = authSession.accessToken;
  elements.copyTokenButton.textContent = "Access Token 복사";
  elements.copyStatus.textContent = "우리 API용 JWT입니다. Google 비밀번호가 아닙니다.";
  elements.tokenLab.hidden = false;
}

async function copyToken() {
  if (!authSession) {
    return;
  }

  try {
    await navigator.clipboard.writeText(authSession.accessToken);
    elements.copyTokenButton.textContent = "복사됨";
    elements.copyStatus.textContent = "학습용 Access Token을 복사했습니다.";
  } catch (_error) {
    elements.fullToken.focus();
    elements.fullToken.select();
    elements.copyStatus.textContent = "자동 복사가 막혔습니다. 선택된 token을 직접 복사하세요.";
  }
}

async function verifyCurrentUser({ focusLocalPassword = false } = {}) {
  if (!authSession) {
    showError("Google 로그인으로 우리 API용 JWT를 먼저 발급받으세요.");
    return false;
  }

  clearError();
  evidence.setState("busy", "요청 중");
  setStage("principal", "active", "/auth/me 확인 중");
  setNotice("우리 JWT를 Bearer token으로 보내 내부 로그인 ID를 확인하고 있습니다.");

  const authorization = `Bearer ${authSession.accessToken}`;

  try {
    const { response, data } = await evidence.requestJson({
      method: "GET",
      endpoint: api.me,
      authorization
    });

    evidence.renderExchange({
      method: "GET",
      endpoint: api.me,
      response,
      authorization,
      data
    });

    if (response.ok && typeof data?.email === "string") {
      const loginMethods = normalizeLoginMethods(data.loginMethods);
      elements.internalEmail.textContent = data.email;
      elements.jwtStatus.textContent = "발급·검증 완료";
      setStage("principal", "success", "200 내부 email 확인");
      setProgress(3);
      showIdentity(data.email);

      if (loginMethods === null || !loginMethods.includes("GOOGLE")) {
        hideLocalPasswordPanel();
        elements.loginMethodsValue.textContent = "응답 계약 확인 필요";
        setStage("credential", "error", "loginMethods 확인 실패");
        setReceipt("error", "로그인 방식 확인 실패");
        evidence.setState("error", "응답 계약 오류");
        showError("/auth/me 응답에서 현재 OAuth 계정의 loginMethods를 확인하지 못했습니다.");
        return false;
      }

      currentLoginMethods = loginMethods;
      elements.loginMethodsValue.textContent = formatLoginMethods(loginMethods);

      if (loginMethods.includes("LOCAL")) {
        showLocalPasswordConfigured(false);
      } else {
        showLocalPasswordSetup(focusLocalPassword);
      }
      return true;
    }

    if (response.status === 401) {
      requireGoogleReauthentication();
      return false;
    }

    elements.loginMethodsValue.textContent = "확인 실패";
    elements.jwtStatus.textContent = `${response.status} 검증 실패`;
    setStage("principal", "error", `${response.status} 신원 확인 실패`);
    setStage("credential", "error", "로그인 방식 확인 중단");
    setReceipt("error", "JWT 검증 실패");
    showIdentityError(data?.message || "보호 API가 현재 사용자를 확인하지 못했습니다.");
    showError(
      window.authPractice.practiceErrorMessage(
        response,
        data?.message || "내부 사용자 확인에 실패했습니다."
      )
    );

    return false;
  } catch (error) {
    evidence.renderNetworkError("GET", api.me, error);
    elements.loginMethodsValue.textContent = "확인 실패";
    elements.jwtStatus.textContent = "서버 연결 실패";
    setStage("principal", "error", "서버 연결 실패");
    setStage("credential", "error", "로그인 방식 확인 중단");
    setReceipt("error", "확인 중단");
    showIdentityError("Spring Boot 서버 연결 상태를 확인하세요.");
    showError("내부 사용자 확인 요청을 완료하지 못했습니다.");
    return false;
  }
}

async function configureLocalPassword() {
  if (!authSession) {
    requireGoogleReauthentication();
    return;
  }

  if (localPasswordConfigured || localPasswordSkipped || !validateLocalPassword()) {
    return;
  }

  const requestBody = {
    newPassword: elements.localPassword.value
  };
  const authorization = `Bearer ${authSession.accessToken}`;

  clearError();
  setBusy(true);
  evidence.setState("busy", "요청 중");
  setStage("credential", "active", "LOCAL 비밀번호 등록 중");
  setLocalPasswordNotice(
    "방금 검증한 우리 JWT로 새 비밀번호를 보내고 있습니다. Google 비밀번호는 사용하지 않습니다."
  );

  try {
    const { response, data } = await evidence.requestJson({
      method: "POST",
      endpoint: api.localPassword,
      body: requestBody,
      authorization
    });

    evidence.renderExchange({
      method: "POST",
      endpoint: api.localPassword,
      response,
      requestBody,
      authorization,
      data
    });

    if (response.status === 204) {
      evidence.setState("success", "LOCAL 등록 완료");
      showLocalPasswordConfigured(true);
      return;
    }

    if (response.status === 401) {
      requireGoogleReauthentication();
      return;
    }

    if (response.status === 409) {
      setLocalPasswordNotice(
        "계정 상태가 먼저 바뀌었습니다. /auth/me로 현재 로그인 방식을 다시 확인하고 있습니다.",
        "notice"
      );
      const verified = await verifyCurrentUser();

      if (!authSession) {
        return;
      }

      if (verified && currentLoginMethods.includes("LOCAL")) {
        return;
      }

      elements.localPasswordPanel.dataset.state = "error";
      elements.localPasswordForm.hidden = true;
      elements.localPasswordState.textContent = "409 등록 불가";
      setStage("credential", "error", "409 계정 상태 충돌");
      elements.localPasswordRequestError.textContent =
        "현재 계정에는 LOCAL 비밀번호를 새로 등록할 수 없습니다. Google 로그인으로 다시 시작해 상태를 확인하세요.";
      elements.localPasswordRequestError.hidden = false;
      setLocalPasswordNotice("LOCAL 자격 등록을 중단했습니다.", "error");
      return;
    }

    if (typeof data?.errors?.newPassword === "string") {
      elements.localPassword.setAttribute("aria-invalid", "true");
      elements.localPasswordError.textContent = data.errors.newPassword;
      elements.localPassword.focus();
    }

    elements.localPasswordPanel.dataset.state = "error";
    elements.localPasswordState.textContent = `${response.status} 등록 실패`;
    setStage("credential", "error", `${response.status} LOCAL 등록 실패`);
    elements.localPasswordRequestError.textContent =
      window.authPractice.practiceErrorMessage(
        response,
        "자체 로그인 비밀번호를 설정하지 못했습니다. 입력과 계정 상태를 확인하세요."
      );
    elements.localPasswordRequestError.hidden = false;
    setLocalPasswordNotice("LOCAL 자격 등록 요청을 완료하지 못했습니다.", "error");
  } catch (error) {
    evidence.renderNetworkError("POST", api.localPassword, error);
    elements.localPasswordPanel.dataset.state = "error";
    elements.localPasswordState.textContent = "서버 연결 실패";
    setStage("credential", "error", "서버 연결 실패");
    elements.localPasswordRequestError.textContent =
      "서버에 연결할 수 없습니다. 같은 페이지에서 다시 시도할 수 있습니다.";
    elements.localPasswordRequestError.hidden = false;
    setLocalPasswordNotice("LOCAL 자격 등록 요청을 완료하지 못했습니다.", "error");
  } finally {
    setBusy(false);
  }
}

function initializeOAuthResult(payload) {
  if (!payload.wasScrubbed) {
    setBusy(false);
    return;
  }

  markAirlockScrubbed();
  const accessToken = payload.access_token;
  payload.access_token = null;

  if (payload.oauth === "link_required") {
    setStage("google", "success", "Google 신원 확인");
    setStage("account", "notice", "자동 연결 중단");
    setStage("principal", "waiting", "계정 연결 뒤 확인");
    setStage("credential", "waiting", "내부 계정 확인 뒤 판단");
    setProgress(1);
    setReceipt("notice", "연결 동의 필요");
    elements.accountStatus.textContent = "기존 동일 email 계정과 분리";
    setNotice("같은 email의 기존 계정이 있어 자동 연결하지 않았습니다.", "notice");
    return;
  }

  if (payload.oauth === "failed") {
    setStage("google", "error", "OAuth 실패");
    setStage("credential", "waiting", "OAuth 성공 뒤 판단");
    setReceipt("error", "로그인 실패");
    setNotice("Google 로그인을 완료하지 못했습니다. 다시 시도하세요.", "error");
    return;
  }

  if (payload.oauth !== "success" || !accessToken) {
    setStage("google", "error", "결과 형식 거부");
    setStage("credential", "waiting", "유효한 결과 없음");
    setReceipt("error", "결과 폐기");
    setNotice("인식할 수 없거나 token이 없는 OAuth 결과를 폐기했습니다.", "error");
    return;
  }

  authSession = { accessToken };
  elements.providerValue.textContent = payload.provider || "미제공";
  if (payload.isNewUser === "true") {
    elements.accountStatus.textContent = "새 내부 OAuth 계정 생성";
    receiptActiveStatus = "신규 계정 확인 중";
    receiptSuccessStatus = "신규 가입 완료";
    receiptSuccessNotice = "Google 신원으로 새 내부 계정을 만들고 /auth/me가 로그인 ID를 확인했습니다.";
  } else if (payload.isNewUser === "false") {
    elements.accountStatus.textContent = "기존 내부 OAuth 계정 재사용";
    receiptActiveStatus = "기존 계정 확인 중";
    receiptSuccessStatus = "기존 가입자 로그인 완료";
    receiptSuccessNotice = "기존 내부 OAuth 계정을 다시 사용하고 /auth/me가 로그인 ID를 확인했습니다.";
  } else {
    elements.accountStatus.textContent = "callback metadata 미제공";
  }
  elements.jwtStatus.textContent = "메모리로 회수";

  setStage("google", "success", "Google 신원 확인");
  setStage("account", "success", elements.accountStatus.textContent);
  setStage("principal", "active", "/auth/me 확인 중");
  setStage("credential", "waiting", "loginMethods 확인 대기");
  setProgress(2);
  setReceipt("active", receiptActiveStatus);
  showTokenReceipt();
  setBusy(true);

  void verifyCurrentUser({ focusLocalPassword: true }).finally(() => {
    setBusy(false);
  });
}

elements.googleLoginLink.addEventListener("click", (event) => {
  if (busy) {
    event.preventDefault();
  }
});

elements.verifyButton.addEventListener("click", () => {
  if (busy || !authSession) {
    return;
  }

  setBusy(true);
  void verifyCurrentUser().finally(() => {
    setBusy(false);
  });
});

elements.clearButton.addEventListener("click", () => {
  authSession = null;
  elements.jwtStatus.textContent = "메모리에서 삭제";
  elements.loginMethodsValue.textContent = "—";
  setStage("principal", "waiting", "Authentication 지움");
  setStage("credential", "waiting", "JWT 확인 뒤 판단");
  setProgress(2);
  setReceipt("waiting", "token 삭제");
  clearTokenReceipt();
  hideLocalPasswordPanel();
  resetIdentity();
  setNotice("브라우저 메모리의 OAuth JWT를 지웠습니다. 다시 Google 로그인을 시작하세요.");
  setBusy(false);
});

elements.copyTokenButton.addEventListener("click", () => {
  if (!busy) {
    void copyToken();
  }
});

elements.localPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!busy) {
    void configureLocalPassword();
  }
});

elements.skipLocalPasswordButton.addEventListener("click", () => {
  if (!busy && authSession) {
    skipLocalPasswordSetup();
  }
});

for (const [input, error] of [
  [elements.localPassword, elements.localPasswordError],
  [elements.localPasswordConfirm, elements.localPasswordConfirmError]
]) {
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    elements.localPasswordRequestError.textContent = "";
    elements.localPasswordRequestError.hidden = true;

    if (authSession && !localPasswordConfigured && !localPasswordSkipped) {
      elements.localPasswordPanel.dataset.state = "active";
      elements.localPasswordState.textContent = "LOCAL 미설정";
      setStage("credential", "active", "새 LOCAL 비밀번호 선택");
    }
  });
}

setBusy(false);
clearTokenReceipt();
resetIdentity();
hideLocalPasswordPanel();

const initialOAuthPayload = landingOAuthPayload;
landingOAuthPayload = null;
initializeOAuthResult(initialOAuthPayload);
