"use strict";

let landingRecoveryPayload = { ...(window.__authPracticeRedirect || { wasScrubbed: false }) };
delete window.__authPracticeRedirect;

const api = {
  recoveryRequest: "/account-recovery/password-reset",
  recoveryConfirm: "/account-recovery/password-reset/confirm"
};

const elements = {
  traceList: document.querySelector("#traceList"),
  secretAirlock: document.querySelector("#secretAirlock"),
  urlScrubState: document.querySelector("#urlScrubState"),
  urlScrubNotice: document.querySelector("#urlScrubNotice"),
  recoveryRequestForm: document.querySelector("#recoveryRequestForm"),
  recoveryEmail: document.querySelector("#recoveryEmail"),
  recoveryEmailError: document.querySelector("#recoveryEmailError"),
  recoveryRequestButton: document.querySelector("#recoveryRequestButton"),
  recoveryNotice: document.querySelector("#recoveryNotice"),
  recoveryError: document.querySelector("#recoveryError"),
  resetPanel: document.querySelector("#resetPanel"),
  resetPanelTitle: document.querySelector("#reset-panel-title"),
  resetForm: document.querySelector("#resetForm"),
  newPassword: document.querySelector("#newPassword"),
  confirmPassword: document.querySelector("#confirmPassword"),
  newPasswordError: document.querySelector("#newPasswordError"),
  confirmPasswordError: document.querySelector("#confirmPasswordError"),
  resetPasswordButton: document.querySelector("#resetPasswordButton"),
  resetNotice: document.querySelector("#resetNotice"),
  resetError: document.querySelector("#resetError")
};

const stages = {
  request: document.querySelector('[data-stage="request"]'),
  mail: document.querySelector('[data-stage="mail"]'),
  confirm: document.querySelector('[data-stage="confirm"]')
};

const evidence = window.authPractice.createHttpEvidence();
let passwordResetToken = null;
let busy = false;

function setStage(name, state, label) {
  const stage = stages[name];
  stage.dataset.state = state;
  stage.querySelector("[data-stage-label]").textContent = label;
}

function setProgress(value) {
  elements.traceList.style.setProperty("--progress", String(value / 2));
}

function setNotice(element, message, tone = "default") {
  window.authPractice.setNotice(element, message, tone);
}

function setRecoveryNotice(message, tone = "default", announce = true) {
  if (announce) {
    elements.recoveryNotice.setAttribute("role", "status");
    elements.recoveryNotice.setAttribute("aria-live", "polite");
  } else {
    // 상세 실패 원인은 바로 아래 role=alert가 한 번만 읽고, 이 문장은 시각적 요약으로만 갱신합니다.
    elements.recoveryNotice.removeAttribute("role");
    elements.recoveryNotice.setAttribute("aria-live", "off");
  }
  setNotice(elements.recoveryNotice, message, tone);
}

function setBusy(isBusy) {
  busy = isBusy;
  elements.recoveryRequestForm.setAttribute("aria-busy", String(isBusy));
  elements.resetForm.setAttribute("aria-busy", String(isBusy));
  elements.recoveryEmail.disabled = isBusy;
  elements.recoveryRequestButton.disabled = isBusy;
  elements.newPassword.disabled = isBusy;
  elements.confirmPassword.disabled = isBusy;
  elements.resetPasswordButton.disabled = isBusy || passwordResetToken === null;
}

function markAirlockScrubbed() {
  elements.secretAirlock.dataset.state = "scrubbed";
  elements.urlScrubState.textContent = "URL 정리 완료";
  elements.urlScrubNotice.textContent =
    "reset token을 브라우저 메모리로 회수하고 현재 주소와 history entry에서 제거했습니다. token 원문은 화면에 표시하지 않습니다.";
}

function clearRecoveryErrors() {
  elements.recoveryEmail.removeAttribute("aria-invalid");
  elements.recoveryEmailError.textContent = "";
  elements.recoveryError.textContent = "";
  elements.recoveryError.hidden = true;
}

function clearResetErrors() {
  for (const [input, error] of [
    [elements.newPassword, elements.newPasswordError],
    [elements.confirmPassword, elements.confirmPasswordError]
  ]) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }

  elements.resetError.textContent = "";
  elements.resetError.hidden = true;
}

function validateNewPassword() {
  clearResetErrors();
  const newPassword = elements.newPassword.value;
  let valid = true;

  if (newPassword.length < 8 || newPassword.length > 64 || newPassword.trim().length === 0) {
    elements.newPassword.setAttribute("aria-invalid", "true");
    elements.newPasswordError.textContent = "새 비밀번호는 공백만으로 구성하지 않은 8~64자여야 합니다.";
    valid = false;
  }

  if (elements.confirmPassword.value !== newPassword) {
    elements.confirmPassword.setAttribute("aria-invalid", "true");
    elements.confirmPasswordError.textContent = "새 비밀번호와 확인 값이 같아야 합니다.";
    valid = false;
  }

  if (!valid) {
    (elements.newPassword.hasAttribute("aria-invalid")
      ? elements.newPassword
      : elements.confirmPassword).focus();
  }

  return valid;
}

async function requestPasswordReset() {
  clearRecoveryErrors();

  const email = elements.recoveryEmail.value;
  if (!email || !elements.recoveryEmail.validity.valid) {
    elements.recoveryEmail.setAttribute("aria-invalid", "true");
    elements.recoveryEmailError.textContent = "올바른 email을 254자 이내로 입력하세요.";
    elements.recoveryEmail.focus();
    return;
  }

  setBusy(true);
  evidence.setState("busy", "요청 중");
  setStage("request", "active", "token 발급·commit 중");
  setStage("mail", "active", "SMTP 결과 대기");
  setRecoveryNotice(
    "token commit 뒤 실제 SMTP 발송 결과가 돌아올 때까지 기다리고 있습니다."
  );

  try {
    const { response, data } = await evidence.requestJson({
      method: "POST",
      endpoint: api.recoveryRequest,
      body: { email }
    });

    evidence.renderExchange({
      method: "POST",
      endpoint: api.recoveryRequest,
      response,
      requestBody: { email },
      data
    });

    if (response.status === 200 && data?.code === "RECOVERY_MAIL_SENT") {
      elements.recoveryEmail.value = "";
      evidence.setState("success", "SMTP 요청 수락");
      setStage("request", "success", "token commit 완료");
      setStage("mail", "success", "200 SMTP 요청 수락");
      setProgress(1);
      setRecoveryNotice(
        "200 OK: SMTP 서버가 메일 요청을 수락했습니다. 받은 편지함 도착은 별도로 확인하세요.",
        "success"
      );
      return;
    }

    if (response.status === 422 && data?.code === "RECOVERY_MAIL_NOT_SENT") {
      setStage("request", "error", "422 발송 대상 없음");
      setStage("mail", "error", "SMTP 호출 안 함");
      setProgress(0);
      elements.recoveryError.textContent =
        "비밀번호 재설정 메일을 보낼 수 없는 계정입니다. 가입 방식과 email을 확인하세요.";
      elements.recoveryError.hidden = false;
      setRecoveryNotice("재설정 메일을 보내지 않았습니다.", "error", false);
      return;
    }

    if (response.status === 429 && data?.code === "RECOVERY_MAIL_COOLDOWN") {
      const retryAfter = response.headers.get("Retry-After");
      const retryMessage = retryAfter
        ? `${retryAfter}초 뒤에 다시 요청할 수 있습니다.`
        : "잠시 후 다시 요청할 수 있습니다.";
      setStage("request", "notice", "429 재요청 대기");
      setStage("mail", "notice", "기존 token 유지");
      setProgress(0);
      elements.recoveryError.textContent = retryMessage;
      elements.recoveryError.hidden = false;
      setRecoveryNotice("이미 유효한 재설정 요청이 있습니다.", "notice", false);
      return;
    }

    if (
      response.status === 424 &&
      [
        "RECOVERY_MAIL_AUTHENTICATION_FAILED",
        "RECOVERY_MAIL_DELIVERY_FAILED"
      ].includes(data?.code)
    ) {
      const authenticationFailed = data.code === "RECOVERY_MAIL_AUTHENTICATION_FAILED";
      setStage("request", "notice", "발송 실패 token 정리 요청");
      setStage(
        "mail",
        "error",
        authenticationFailed ? "앱 비밀번호 확인" : "SMTP 전송 확인"
      );
      setProgress(1);
      elements.recoveryError.textContent = authenticationFailed
        ? "Gmail 앱 비밀번호가 없거나 올바르지 않습니다. .env의 SMTP 계정과 앱 비밀번호를 확인하고 애플리케이션을 재시작하세요."
        : "SMTP 서버가 발송을 완료하지 못했습니다. host·port·STARTTLS·발신자 설정과 애플리케이션 로그를 확인한 뒤 다시 시도하세요.";
      elements.recoveryError.hidden = false;
      setRecoveryNotice(
        "메일 발송 완료를 확인하지 못해 이번 발급 건의 token 정리를 요청했습니다.",
        "error",
        false
      );
      return;
    }

    if (typeof data?.errors?.email === "string") {
      elements.recoveryEmail.setAttribute("aria-invalid", "true");
      elements.recoveryEmailError.textContent = data.errors.email;
    }

    setStage("request", "error", `${response.status} 입력 확인`);
    elements.recoveryError.textContent = window.authPractice.practiceErrorMessage(
      response,
      "복구 요청 형식을 확인한 뒤 다시 시도하세요."
    );
    elements.recoveryError.hidden = false;
    setRecoveryNotice("복구 요청을 접수하지 못했습니다.", "error", false);
  } catch (error) {
    evidence.renderNetworkError("POST", api.recoveryRequest, error);
    setStage("request", "error", "서버 연결 실패");
    elements.recoveryError.textContent = "서버에 연결할 수 없습니다. Spring Boot 실행 상태를 확인하세요.";
    elements.recoveryError.hidden = false;
    setRecoveryNotice("복구 요청을 완료하지 못했습니다.", "error", false);
  } finally {
    setBusy(false);
  }
}

function retirePasswordResetToken(message, tone, stageState) {
  passwordResetToken = null;
  elements.newPassword.value = "";
  elements.confirmPassword.value = "";
  elements.resetForm.hidden = true;
  setStage("confirm", stageState, message);
  setNotice(elements.resetNotice, message, tone);
  setBusy(false);
}

async function confirmPasswordReset() {
  if (!passwordResetToken) {
    retirePasswordResetToken("재설정 링크가 유효하지 않거나 이미 처리되었습니다.", "error", "error");
    return;
  }

  if (!validateNewPassword()) {
    return;
  }

  const requestBody = {
    token: passwordResetToken,
    newPassword: elements.newPassword.value
  };

  setBusy(true);
  evidence.setState("busy", "요청 중");
  setStage("confirm", "active", "token 검증 중");
  setNotice(elements.resetNotice, "서버가 token hash·만료·사용 여부를 확인하고 있습니다.");

  try {
    const { response, data } = await evidence.requestJson({
      method: "POST",
      endpoint: api.recoveryConfirm,
      body: requestBody
    });

    evidence.renderExchange({
      method: "POST",
      endpoint: api.recoveryConfirm,
      response,
      requestBody,
      data
    });

    if (response.status === 204) {
      setProgress(2);
      retirePasswordResetToken(
        "204 비밀번호 변경 완료 · 일회용 token 폐기",
        "success",
        "success"
      );
      return;
    }

    if (typeof data?.errors?.newPassword === "string") {
      elements.newPassword.setAttribute("aria-invalid", "true");
      elements.newPasswordError.textContent = data.errors.newPassword;
      setStage("confirm", "error", `${response.status} 새 비밀번호 확인`);
    } else if (response.status === 400) {
      retirePasswordResetToken("재설정 링크가 유효하지 않거나 만료되었습니다.", "error", "error");
    }

    elements.resetError.textContent = window.authPractice.practiceErrorMessage(
      response,
      "비밀번호를 변경하지 못했습니다. 재설정 링크를 다시 요청하세요."
    );
    elements.resetError.hidden = false;
  } catch (error) {
    evidence.renderNetworkError("POST", api.recoveryConfirm, error);
    setStage("confirm", "error", "서버 연결 실패");
    elements.resetError.textContent = "서버에 연결할 수 없습니다. 같은 페이지에서 다시 시도할 수 있습니다.";
    elements.resetError.hidden = false;
    setNotice(elements.resetNotice, "비밀번호 변경 요청을 완료하지 못했습니다.", "error");
  } finally {
    setBusy(false);
  }
}

function showInvalidResetLink() {
  elements.resetPanel.hidden = false;
  elements.resetForm.hidden = true;
  passwordResetToken = null;
  setStage("mail", "error", "링크 형식 거부");
  setStage("confirm", "error", "유효한 token 없음");
  setNotice(elements.resetNotice, "재설정 링크가 유효하지 않거나 만료되었습니다.", "error");
}

function focusResetPanel() {
  const moveFocus = () => window.requestAnimationFrame(() => {
    elements.resetPanel.scrollIntoView({ block: "start" });
    elements.resetPanelTitle.focus({ preventScroll: true });
  });

  if (document.readyState === "complete") {
    moveFocus();
  } else {
    window.addEventListener("load", moveFocus, { once: true });
  }
}

function initializeRecoveryResult(payload) {
  if (!payload.wasScrubbed) {
    setBusy(false);
    return;
  }

  markAirlockScrubbed();
  const resetToken = payload.reset_token;
  payload.reset_token = null;

  if (!resetToken || !/^[A-Za-z0-9_-]{43}$/.test(resetToken)) {
    showInvalidResetLink();
    setBusy(false);
    return;
  }

  passwordResetToken = resetToken;
  setStage("request", "success", "메일 링크에서 진입");
  setStage("mail", "success", "token 주소에서 회수");
  setStage("confirm", "active", "새 비밀번호 입력 대기");
  setProgress(2);
  elements.resetPanel.hidden = false;
  elements.resetForm.hidden = false;
  setNotice(
    elements.resetNotice,
    "주소에서 reset token을 회수했습니다. 비밀번호를 변경하면 같은 token은 다시 사용할 수 없습니다.",
    "notice"
  );
  setBusy(false);
  focusResetPanel();
}

elements.recoveryRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!busy) {
    void requestPasswordReset();
  }
});

elements.resetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!busy) {
    void confirmPasswordReset();
  }
});

elements.recoveryEmail.addEventListener("input", clearRecoveryErrors);

for (const [input, error] of [
  [elements.newPassword, elements.newPasswordError],
  [elements.confirmPassword, elements.confirmPasswordError]
]) {
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    elements.resetError.textContent = "";
    elements.resetError.hidden = true;
  });
}

setBusy(false);

const initialRecoveryPayload = landingRecoveryPayload;
landingRecoveryPayload = null;
initializeRecoveryResult(initialRecoveryPayload);
