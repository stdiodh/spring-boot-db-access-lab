"use strict";

let landingOAuthPayload = { ...(window.__authPracticeRedirect || { wasScrubbed: false }) };
delete window.__authPracticeRedirect;

const api = {
  me: "/auth/me"
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
  verifyButton: document.querySelector("#verifyButton"),
  clearButton: document.querySelector("#clearButton"),
  tokenLab: document.querySelector("#tokenLab"),
  fullToken: document.querySelector("#fullToken"),
  copyTokenButton: document.querySelector("#copyTokenButton"),
  copyStatus: document.querySelector("#copyStatus"),
  identityProof: document.querySelector("#identityProof"),
  identityTitle: document.querySelector("#identity-title"),
  identityDescription: document.querySelector("#identityDescription"),
  identityStatus: document.querySelector("#identityStatus")
};

const stages = {
  google: document.querySelector('[data-stage="google"]'),
  account: document.querySelector('[data-stage="account"]'),
  principal: document.querySelector('[data-stage="principal"]')
};

const evidence = window.authPractice.createHttpEvidence();
let authSession = null;
let busy = false;

function setStage(name, state, label) {
  const stage = stages[name];
  stage.dataset.state = state;
  stage.querySelector("[data-stage-label]").textContent = label;
}

function setProgress(value) {
  elements.traceList.style.setProperty("--progress", String(value / 2));
}

function setNotice(message, tone = "default") {
  window.authPractice.setNotice(elements.oauthNotice, message, tone);
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
  elements.googleLoginLink.setAttribute("aria-disabled", String(isBusy));
  elements.verifyButton.disabled = isBusy || authSession === null;
  elements.clearButton.disabled = isBusy || authSession === null;
  elements.copyTokenButton.disabled = isBusy || authSession === null;
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

async function verifyCurrentUser() {
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
      elements.internalEmail.textContent = data.email;
      elements.jwtStatus.textContent = "발급·검증 완료";
      setStage("principal", "success", "200 내부 email 확인");
      setProgress(2);
      setReceipt("success", "가입 확인 완료");
      showIdentity(data.email);
      setNotice("Google 신원을 내부 계정에 연결했고 /auth/me가 로그인 ID를 확인했습니다.", "success");
      return true;
    }

    elements.jwtStatus.textContent = `${response.status} 검증 실패`;
    setStage("principal", "error", `${response.status} 신원 확인 실패`);
    setReceipt("error", "JWT 검증 실패");
    showIdentityError(data?.message || "보호 API가 현재 사용자를 확인하지 못했습니다.");
    showError(
      window.authPractice.practiceErrorMessage(
        response,
        data?.message || "내부 사용자 확인에 실패했습니다."
      )
    );

    if (response.status === 401) {
      authSession = null;
      clearTokenReceipt();
    }
    return false;
  } catch (error) {
    evidence.renderNetworkError("GET", api.me, error);
    elements.jwtStatus.textContent = "서버 연결 실패";
    setStage("principal", "error", "서버 연결 실패");
    setReceipt("error", "확인 중단");
    showIdentityError("Spring Boot 서버 연결 상태를 확인하세요.");
    showError("내부 사용자 확인 요청을 완료하지 못했습니다.");
    return false;
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
    setProgress(1);
    setReceipt("notice", "연결 동의 필요");
    elements.accountStatus.textContent = "기존 동일 email 계정과 분리";
    setNotice("같은 email의 기존 계정이 있어 자동 연결하지 않았습니다.", "notice");
    return;
  }

  if (payload.oauth === "failed") {
    setStage("google", "error", "OAuth 실패");
    setReceipt("error", "로그인 실패");
    setNotice("Google 로그인을 완료하지 못했습니다. 다시 시도하세요.", "error");
    return;
  }

  if (payload.oauth !== "success" || !accessToken) {
    setStage("google", "error", "결과 형식 거부");
    setReceipt("error", "결과 폐기");
    setNotice("인식할 수 없거나 token이 없는 OAuth 결과를 폐기했습니다.", "error");
    return;
  }

  authSession = { accessToken };
  elements.providerValue.textContent = payload.provider || "미제공";
  elements.accountStatus.textContent = payload.isNewUser === "true"
    ? "새 내부 OAuth 계정 생성"
    : payload.isNewUser === "false"
      ? "기존 내부 OAuth 계정 재사용"
      : "callback metadata 미제공";
  elements.jwtStatus.textContent = "메모리로 회수";

  setStage("google", "success", "Google 신원 확인");
  setStage("account", "success", elements.accountStatus.textContent);
  setStage("principal", "active", "/auth/me 확인 중");
  setProgress(2);
  setReceipt("active", "내부 신원 확인 중");
  showTokenReceipt();
  setBusy(true);

  void verifyCurrentUser().finally(() => {
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
  setStage("principal", "waiting", "Authentication 지움");
  setReceipt("waiting", "token 삭제");
  clearTokenReceipt();
  resetIdentity();
  setNotice("브라우저 메모리의 OAuth JWT를 지웠습니다. 다시 Google 로그인을 시작하세요.");
  setBusy(false);
});

elements.copyTokenButton.addEventListener("click", () => {
  if (!busy) {
    void copyToken();
  }
});

setBusy(false);
clearTokenReceipt();
resetIdentity();

const initialOAuthPayload = landingOAuthPayload;
landingOAuthPayload = null;
initializeOAuthResult(initialOAuthPayload);
