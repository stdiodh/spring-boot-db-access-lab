"use strict";

const api = {
  signup: "/auth/signup",
  login: "/auth/login",
  me: "/auth/me",
  posts: "/posts"
};

const elements = {
  originLabel: document.querySelector("#originLabel"),
  traceList: document.querySelector("#traceList"),
  authForm: document.querySelector("#authForm"),
  email: document.querySelector("#email"),
  password: document.querySelector("#password"),
  passwordToggle: document.querySelector("#passwordToggle"),
  signupButton: document.querySelector("#signupButton"),
  loginButton: document.querySelector("#loginButton"),
  verifyButton: document.querySelector("#verifyButton"),
  clearButton: document.querySelector("#clearButton"),
  emailError: document.querySelector("#emailError"),
  passwordError: document.querySelector("#passwordError"),
  formNotice: document.querySelector("#formNotice"),
  formError: document.querySelector("#formError"),
  tokenLab: document.querySelector("#tokenLab"),
  fullToken: document.querySelector("#fullToken"),
  copyTokenButton: document.querySelector("#copyTokenButton"),
  copyStatus: document.querySelector("#copyStatus"),
  tokenType: document.querySelector("#tokenType"),
  tokenExpires: document.querySelector("#tokenExpires"),
  identityProof: document.querySelector("#identityProof"),
  identityTitle: document.querySelector("#identity-title"),
  identityDescription: document.querySelector("#identityDescription"),
  identityStatus: document.querySelector("#identityStatus"),
  authorHandoff: document.querySelector("#authorHandoff"),
  postAuthor: document.querySelector("#postAuthor"),
  postForm: document.querySelector("#postForm"),
  postFields: document.querySelector("#postFields"),
  postTitle: document.querySelector("#postTitle"),
  postContent: document.querySelector("#postContent"),
  postTitleError: document.querySelector("#postTitleError"),
  postContentError: document.querySelector("#postContentError"),
  postTitleCount: document.querySelector("#postTitleCount"),
  postContentCount: document.querySelector("#postContentCount"),
  postNotice: document.querySelector("#postNotice"),
  postError: document.querySelector("#postError"),
  refreshPostsButton: document.querySelector("#refreshPostsButton"),
  postListStatus: document.querySelector("#postListStatus"),
  postList: document.querySelector("#postList")
};

const stages = {
  account: document.querySelector('[data-stage="account"]'),
  token: document.querySelector('[data-stage="token"]'),
  principal: document.querySelector('[data-stage="principal"]')
};

const evidence = window.authPractice.createHttpEvidence();
let authSession = null;
let accountEmail = null;
let verifiedEmail = null;
let busy = false;
let visiblePosts = [];

elements.originLabel.textContent = window.location.origin;

function setStage(name, state, label) {
  const stage = stages[name];
  stage.dataset.state = state;
  stage.querySelector("[data-stage-label]").textContent = label;
}

function setProgress(value) {
  elements.traceList.style.setProperty("--progress", String(value / 2));
}

function setNotice(message, tone = "default") {
  window.authPractice.setNotice(elements.formNotice, message, tone);
}

function showError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = false;
}

function clearErrors() {
  elements.formError.textContent = "";
  elements.formError.hidden = true;

  for (const [input, error] of [
    [elements.email, elements.emailError],
    [elements.password, elements.passwordError]
  ]) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }
}

function renderFieldErrors(errors = {}) {
  for (const [field, input, error] of [
    ["email", elements.email, elements.emailError],
    ["password", elements.password, elements.passwordError]
  ]) {
    if (typeof errors[field] === "string" && errors[field]) {
      input.setAttribute("aria-invalid", "true");
      error.textContent = errors[field];
    }
  }
}

function setBusy(isBusy) {
  busy = isBusy;
  elements.authForm.setAttribute("aria-busy", String(isBusy));
  elements.postForm.setAttribute("aria-busy", String(isBusy));
  elements.email.disabled = isBusy;
  elements.password.disabled = isBusy;
  elements.passwordToggle.disabled = isBusy;
  elements.signupButton.disabled = isBusy;
  elements.loginButton.disabled = isBusy;
  elements.verifyButton.disabled = isBusy || authSession === null;
  elements.clearButton.disabled = isBusy || authSession === null;
  elements.copyTokenButton.disabled = isBusy || authSession === null;
  elements.postFields.disabled = isBusy || verifiedEmail === null;
  elements.refreshPostsButton.disabled = isBusy;
}

function readCredentials() {
  return {
    email: elements.email.value,
    password: elements.password.value
  };
}

function normalizeEmail(email) {
  return email.toLowerCase();
}

function isCurrentAccount(email = elements.email.value) {
  return accountEmail !== null && accountEmail === normalizeEmail(email);
}

function clearTokenReceipt() {
  elements.tokenLab.hidden = true;
  elements.fullToken.value = "";
  elements.tokenType.textContent = "—";
  elements.tokenExpires.textContent = "—";
  elements.copyTokenButton.textContent = "Access Token 복사";
  elements.copyStatus.textContent = "jwt.io에는 자동으로 전송하지 않습니다.";
}

function showTokenReceipt() {
  if (!authSession) {
    clearTokenReceipt();
    return;
  }

  elements.tokenType.textContent = authSession.tokenType;
  elements.tokenExpires.textContent = authSession.expiresIn === null
    ? "응답에 없음"
    : `${authSession.expiresIn}초`;
  elements.fullToken.value = authSession.accessToken;
  elements.copyTokenButton.textContent = "Access Token 복사";
  elements.copyStatus.textContent = "복사한 뒤 jwt.io의 Encoded 칸에 직접 붙여넣으세요.";
  elements.tokenLab.hidden = false;
}

async function copyToken() {
  if (!authSession) {
    return;
  }

  try {
    await navigator.clipboard.writeText(authSession.accessToken);
    elements.copyTokenButton.textContent = "복사됨";
    elements.copyStatus.textContent = "Access Token을 복사했습니다. 실습 후 클립보드에서도 지우세요.";
  } catch (_error) {
    elements.fullToken.focus();
    elements.fullToken.select();
    elements.copyStatus.textContent = "자동 복사가 막혔습니다. 선택된 token을 직접 복사하세요.";
  }
}

function setPostNotice(message, tone = "default") {
  window.authPractice.setNotice(elements.postNotice, message, tone);
}

function showPostError(message) {
  elements.postError.textContent = message;
  elements.postError.hidden = false;
}

function clearPostErrors() {
  elements.postError.textContent = "";
  elements.postError.hidden = true;

  for (const [input, error] of [
    [elements.postTitle, elements.postTitleError],
    [elements.postContent, elements.postContentError]
  ]) {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
  }
}

function renderPostFieldErrors(errors = {}) {
  for (const [field, input, error] of [
    ["title", elements.postTitle, elements.postTitleError],
    ["content", elements.postContent, elements.postContentError]
  ]) {
    if (typeof errors[field] === "string" && errors[field]) {
      input.setAttribute("aria-invalid", "true");
      error.textContent = errors[field];
    }
  }
}

function resetPostComposer() {
  verifiedEmail = null;
  elements.authorHandoff.dataset.state = "locked";
  elements.postAuthor.textContent = "로그인 신원 확인 전";
  elements.postFields.disabled = true;
  clearPostErrors();
  setPostNotice("로그인하고 /auth/me 확인까지 성공하면 작성 영역이 열립니다.");
}

function unlockPostComposer(email) {
  verifiedEmail = email;
  elements.authorHandoff.dataset.state = "ready";
  elements.postAuthor.textContent = email;
  elements.postFields.disabled = busy;
  clearPostErrors();
  setPostNotice(`${email} 신원으로 게시물을 작성할 수 있습니다. author는 서버가 결정합니다.`, "success");
}

function updatePostCounters() {
  elements.postTitleCount.textContent = `${elements.postTitle.value.length} / 100`;
  elements.postContentCount.textContent = `${elements.postContent.value.length} / 5000`;
}

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "post-card";

  const header = document.createElement("div");
  header.className = "post-card__header";

  const id = document.createElement("span");
  id.className = "post-card__id";
  id.textContent = `#${post.id}`;

  const title = document.createElement("h4");
  title.textContent = post.title;

  const content = document.createElement("p");
  content.className = "post-card__content";
  content.textContent = post.content;

  const author = document.createElement("p");
  author.className = "post-card__author";
  author.append("author · ");

  const authorName = document.createElement("strong");
  authorName.textContent = post.author;
  author.append(authorName);

  header.append(id, title);
  article.append(header, content, author);
  return article;
}

function renderPosts(posts, statusMessage) {
  visiblePosts = [...posts].sort((left, right) => right.id - left.id);
  elements.postList.replaceChildren();

  if (visiblePosts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "post-list__empty";
    empty.textContent = "등록된 게시물이 없습니다. 로그인 후 첫 게시물을 작성해 보세요.";
    elements.postList.append(empty);
  } else {
    const fragment = document.createDocumentFragment();
    for (const post of visiblePosts) {
      fragment.append(createPostCard(post));
    }
    elements.postList.append(fragment);
  }

  elements.postListStatus.textContent = statusMessage;
}

function resetIdentity() {
  elements.identityProof.dataset.state = "waiting";
  elements.identityTitle.textContent = "아직 로그인 신원을 확인하지 않았습니다.";
  elements.identityDescription.textContent = "로그인 성공 후 access token으로 GET /auth/me를 호출하면 서버가 확인한 email이 표시됩니다.";
  elements.identityStatus.textContent = "확인 전";
}

function showIdentity(email) {
  elements.identityProof.dataset.state = "success";
  elements.identityTitle.textContent = `서버가 나를 ${email}로 확인했습니다.`;
  elements.identityDescription.textContent = "JWT subject가 Authentication principal로 등록되고, 보호 API가 같은 email을 반환했습니다.";
  elements.identityStatus.textContent = "로그인 완료";
  unlockPostComposer(email);
}

function showIdentityError(message) {
  elements.identityProof.dataset.state = "error";
  elements.identityTitle.textContent = "현재 사용자 확인에 실패했습니다.";
  elements.identityDescription.textContent = message;
  elements.identityStatus.textContent = "확인 실패";
  resetPostComposer();
}

function clearPasswordField() {
  elements.password.value = "";
  elements.password.type = "password";
  elements.passwordToggle.textContent = "표시";
  elements.passwordToggle.setAttribute("aria-pressed", "false");
}

function clearAuthenticatedIdentity() {
  authSession = null;
  clearTokenReceipt();
  setStage("principal", "waiting", "아직 Authentication 없음");
  resetIdentity();
  resetPostComposer();
}

function renderAuthApiError(data, response, fallbackMessage) {
  renderFieldErrors(data?.errors);
  showError(window.authPractice.practiceErrorMessage(response, data?.message || fallbackMessage));
}

async function signup() {
  clearErrors();
  clearAuthenticatedIdentity();
  evidence.clear();
  setBusy(true);
  setStage("account", "active", "계정 생성 요청 중");
  setStage("token", "waiting", "아직 token 없음");
  setProgress(0);
  evidence.setState("busy", "요청 중");
  setNotice("계정 생성 요청을 보내고 있습니다.");

  const credentials = readCredentials();
  let shouldFocusLogin = false;

  try {
    const { response, data } = await evidence.requestJson({
      method: "POST",
      endpoint: api.signup,
      body: credentials
    });

    evidence.renderExchange({
      method: "POST",
      endpoint: api.signup,
      response,
      requestBody: credentials,
      data
    });

    if (response.status === 201) {
      accountEmail = normalizeEmail(credentials.email);
      shouldFocusLogin = true;
      setStage("account", "success", "201 계정 생성");
      setStage("token", "active", "로그인 대기");
      setProgress(1);
      setNotice("계정을 만들었습니다. 같은 값으로 로그인해 token과 현재 사용자를 확인하세요.", "success");
      return;
    }

    if (response.status === 409) {
      accountEmail = normalizeEmail(credentials.email);
      shouldFocusLogin = true;
      setStage("account", "notice", "409 이미 가입됨");
      setStage("token", "active", "로그인 가능");
      setProgress(1);
      setNotice("이미 가입된 email입니다. 입력한 비밀번호로 로그인을 계속할 수 있습니다.", "notice");
      return;
    }

    accountEmail = null;
    setStage("account", "error", `${response.status} 입력 확인`);
    renderAuthApiError(data, response, "계정을 만들 수 없습니다. 입력값과 응답을 확인하세요.");
  } catch (error) {
    accountEmail = null;
    setStage("account", "error", "서버 연결 실패");
    evidence.renderNetworkError("POST", api.signup, error);
    showError("서버에 연결할 수 없습니다. Spring Boot 실행 상태를 확인하세요.");
  } finally {
    setBusy(false);
    if (shouldFocusLogin) {
      elements.loginButton.focus();
    }
  }
}

async function login() {
  clearErrors();
  clearAuthenticatedIdentity();
  setBusy(true);
  setStage("token", "active", "자격 정보 확인 중");
  setStage("principal", "waiting", "아직 Authentication 없음");
  evidence.setState("busy", "요청 중");
  setNotice("로그인 요청에서 자격 정보를 확인하고 있습니다.");

  const credentials = readCredentials();

  try {
    const { response, data } = await evidence.requestJson({
      method: "POST",
      endpoint: api.login,
      body: credentials
    });

    evidence.renderExchange({
      method: "POST",
      endpoint: api.login,
      response,
      requestBody: credentials,
      data
    });

    if (!response.ok || !data?.accessToken) {
      setStage("token", "error", `${response.status} 로그인 실패`);
      setProgress(isCurrentAccount(credentials.email) ? 1 : 0);
      renderAuthApiError(data, response, "로그인에 실패했습니다. email과 비밀번호를 확인하세요.");
      return;
    }

    if (!isCurrentAccount(credentials.email)) {
      accountEmail = normalizeEmail(credentials.email);
      setStage("account", "notice", "기존 계정 사용");
    }

    authSession = {
      accessToken: data.accessToken,
      tokenType: data.tokenType || "Bearer",
      expiresIn: typeof data.expiresIn === "number" ? data.expiresIn : null
    };

    setStage("token", "success", "200 token 발급");
    setStage("principal", "active", "/auth/me 확인 중");
    setProgress(2);
    showTokenReceipt();
    await verifyCurrentUser();
  } catch (error) {
    authSession = null;
    setStage("token", "error", "서버 연결 실패");
    setProgress(isCurrentAccount(credentials.email) ? 1 : 0);
    evidence.renderNetworkError("POST", api.login, error);
    showError("서버에 연결할 수 없습니다. Spring Boot 실행 상태를 확인하세요.");
  } finally {
    setBusy(false);
  }
}

async function verifyCurrentUser() {
  if (!authSession) {
    showError("먼저 로그인해 access token을 발급받으세요.");
    return;
  }

  clearErrors();
  setStage("principal", "active", "/auth/me 확인 중");
  evidence.setState("busy", "요청 중");
  setNotice("발급된 token으로 현재 사용자를 확인하고 있습니다.");

  const authorization = `${authSession.tokenType} ${authSession.accessToken}`;

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
      accountEmail = normalizeEmail(data.email);
      elements.email.value = data.email;
      setStage("account", "success", "내부 계정 확인");
      setStage("principal", "success", "200 email 확인");
      setProgress(2);
      showIdentity(data.email);
      clearPasswordField();
      setNotice("로그인 완료: 서버가 현재 사용자를 확인했습니다.", "success");
      return;
    }

    setStage("principal", "error", `${response.status} 신원 확인 실패`);
    showIdentityError(data?.message || "보호 API가 현재 사용자를 확인하지 못했습니다.");
    renderAuthApiError(data, response, "현재 사용자 확인에 실패했습니다.");

    if (response.status === 401) {
      authSession = null;
      clearTokenReceipt();
    }
  } catch (error) {
    setStage("principal", "error", "서버 연결 실패");
    evidence.renderNetworkError("GET", api.me, error);
    showIdentityError("서버에 연결할 수 없습니다. Spring Boot 실행 상태를 확인하세요.");
    showError("현재 사용자 확인 요청을 완료하지 못했습니다.");
  }
}

async function createPost() {
  if (!authSession || !verifiedEmail) {
    showPostError("먼저 로그인해 서버가 확인한 신원을 준비하세요.");
    return;
  }

  clearPostErrors();
  setBusy(true);
  evidence.setState("busy", "요청 중");
  setPostNotice(`${verifiedEmail} Principal을 author로 전달하고 있습니다.`);

  const requestBody = {
    title: elements.postTitle.value,
    content: elements.postContent.value
  };
  const authorization = `${authSession.tokenType} ${authSession.accessToken}`;

  try {
    const { response, data } = await evidence.requestJson({
      method: "POST",
      endpoint: api.posts,
      body: requestBody,
      authorization
    });

    evidence.renderExchange({
      method: "POST",
      endpoint: api.posts,
      response,
      requestBody,
      authorization,
      data
    });

    if (response.status === 201 && data?.id !== undefined) {
      elements.postTitle.value = "";
      elements.postContent.value = "";
      updatePostCounters();
      renderPosts(
        [data, ...visiblePosts.filter((item) => item.id !== data.id)],
        `201 Created · #${data.id} 게시물을 목록에 반영했습니다.`
      );
      setPostNotice(`게시물 #${data.id}을 등록했습니다. author가 로그인 email과 같은지 확인하세요.`, "success");
      elements.postTitle.focus();
      return;
    }

    renderPostFieldErrors(data?.errors);
    if (response.status === 401) {
      clearAuthenticatedIdentity();
      setStage("token", "error", "401 token 재발급 필요");
      setStage("principal", "error", "Authentication 만료");
      showIdentityError("게시물 작성 요청에서 token을 인증하지 못했습니다. 다시 로그인하세요.");
    }

    showPostError(
      window.authPractice.practiceErrorMessage(
        response,
        data?.message || "게시물을 등록할 수 없습니다. 응답을 확인하세요."
      )
    );
  } catch (error) {
    evidence.renderNetworkError("POST", api.posts, error);
    showPostError("서버에 연결할 수 없습니다. Spring Boot 실행 상태를 확인하세요.");
  } finally {
    setBusy(false);
  }
}

async function loadPosts() {
  setBusy(true);
  evidence.setState("busy", "요청 중");
  elements.postListStatus.textContent = "공개 게시물 목록을 요청하고 있습니다.";

  try {
    const { response, data } = await evidence.requestJson({
      method: "GET",
      endpoint: api.posts
    });

    evidence.renderExchange({
      method: "GET",
      endpoint: api.posts,
      response,
      data
    });

    if (response.ok && Array.isArray(data)) {
      renderPosts(data, `200 OK · 게시물 ${data.length}개를 조회했습니다.`);
      return;
    }

    elements.postListStatus.textContent = window.authPractice.practiceErrorMessage(
      response,
      data?.message || "게시물 목록을 불러오지 못했습니다."
    );
  } catch (error) {
    evidence.renderNetworkError("GET", api.posts, error);
    elements.postListStatus.textContent = "서버에 연결할 수 없습니다. Spring Boot 실행 상태를 확인하세요.";
  } finally {
    setBusy(false);
  }
}

function clearSession() {
  clearAuthenticatedIdentity();
  setStage("token", isCurrentAccount() ? "active" : "waiting", isCurrentAccount() ? "다시 로그인 가능" : "아직 token 없음");
  setStage("principal", "waiting", "Authentication 지움");
  setProgress(isCurrentAccount() ? 1 : 0);
  setNotice("브라우저 메모리의 token을 지웠습니다. 다시 로그인하면 새 token을 확인할 수 있습니다.");
  setBusy(false);
}

elements.authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!busy) {
    void login();
  }
});

elements.signupButton.addEventListener("click", () => {
  if (!busy) {
    void signup();
  }
});

elements.verifyButton.addEventListener("click", async () => {
  if (busy || !authSession) {
    return;
  }

  setBusy(true);
  try {
    await verifyCurrentUser();
  } finally {
    setBusy(false);
  }
});

elements.clearButton.addEventListener("click", clearSession);
elements.copyTokenButton.addEventListener("click", () => {
  if (!busy) {
    void copyToken();
  }
});

elements.postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!busy) {
    void createPost();
  }
});

elements.refreshPostsButton.addEventListener("click", () => {
  if (!busy) {
    void loadPosts();
  }
});

for (const [input, error] of [
  [elements.postTitle, elements.postTitleError],
  [elements.postContent, elements.postContentError]
]) {
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    updatePostCounters();
  });
}

elements.email.addEventListener("input", () => {
  if (isCurrentAccount()) {
    setStage("account", "success", "이 email의 계정 준비됨");
    setStage("token", "active", "로그인 대기");
    setProgress(1);
    return;
  }

  clearAuthenticatedIdentity();
  setStage("account", "active", "현재 email로 계정 확인 필요");
  setStage("token", "waiting", "아직 token 없음");
  setProgress(0);
  setBusy(false);
});

elements.passwordToggle.addEventListener("click", () => {
  const shouldShow = elements.password.type === "password";
  elements.password.type = shouldShow ? "text" : "password";
  elements.passwordToggle.textContent = shouldShow ? "숨김" : "표시";
  elements.passwordToggle.setAttribute("aria-pressed", String(shouldShow));
  elements.password.focus();
});

setBusy(false);
clearTokenReceipt();
resetIdentity();
resetPostComposer();
updatePostCounters();
