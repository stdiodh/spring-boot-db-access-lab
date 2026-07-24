"use strict";

(() => {
  async function readResponseBody(response) {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (_error) {
      return { message: text };
    }
  }

  async function requestJson({ method, endpoint, body, authorization }) {
    const headers = { Accept: "application/json" };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(endpoint, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    return {
      response,
      data: await readResponseBody(response)
    };
  }

  function statusLabel(response) {
    return response.statusText
      ? `${response.status} ${response.statusText}`
      : String(response.status);
  }

  function safeResponse(data) {
    if (!data || typeof data !== "object" || !("accessToken" in data)) {
      return data;
    }

    return {
      accessToken: "[Access Token 표시 영역에서만 확인]",
      tokenType: data.tokenType || "Bearer",
      expiresIn: data.expiresIn ?? "응답에 없음"
    };
  }

  function safeRequestBody(body) {
    if (!body || typeof body !== "object") {
      return body;
    }

    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key,
        /email|password|token/i.test(key) ? "[입력값 숨김]" : value
      ])
    );
  }

  function createHttpEvidence() {
    const elements = {
      state: document.querySelector("#requestState"),
      method: document.querySelector("#requestMethod"),
      endpoint: document.querySelector("#requestEndpoint"),
      status: document.querySelector("#responseStatus"),
      body: document.querySelector("#responseBody")
    };
    let exchanges = [];

    function setState(state, label) {
      elements.state.dataset.state = state;
      elements.state.textContent = label;
    }

    function clear() {
      exchanges = [];
      elements.method.textContent = "—";
      elements.endpoint.textContent = "—";
      elements.status.textContent = "—";
      elements.body.textContent = "아직 요청하지 않았습니다.";
      setState("waiting", "대기");
    }

    function renderExchange({ method, endpoint, response, requestBody, authorization, data }) {
      elements.method.textContent = method;
      elements.endpoint.textContent = endpoint;
      elements.status.textContent = statusLabel(response);
      setState(response.ok ? "success" : "error", response.ok ? "응답 완료" : "실패 응답");

      const request = { method, endpoint };
      if (requestBody !== undefined) {
        request.body = safeRequestBody(requestBody);
      }
      if (authorization) {
        request.Authorization = `${authorization.split(" ")[0]} [token 숨김]`;
      }

      exchanges.push({
        request,
        status: statusLabel(response),
        response: safeResponse(data)
      });
      exchanges = exchanges.slice(-3);
      elements.body.textContent = JSON.stringify({ exchanges }, null, 2);
    }

    function renderNetworkError(method, endpoint, error) {
      elements.method.textContent = method;
      elements.endpoint.textContent = endpoint;
      elements.status.textContent = "NETWORK ERROR";
      setState("error", "연결 실패");
      exchanges.push({
        request: { method, endpoint },
        status: "NETWORK ERROR",
        response: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "서버에 연결할 수 없습니다."
        }
      });
      exchanges = exchanges.slice(-3);
      elements.body.textContent = JSON.stringify({ exchanges }, null, 2);
    }

    return Object.freeze({
      clear,
      renderExchange,
      renderNetworkError,
      requestJson,
      setState
    });
  }

  function practiceErrorMessage(response, fallbackMessage) {
    if (response.status >= 500) {
      return "HTTP 5xx 응답입니다. 관련 계약 테스트와 서버 로그를 확인하세요.";
    }

    return fallbackMessage;
  }

  function setNotice(element, message, tone = "default") {
    element.textContent = message;
    element.dataset.tone = tone;
  }

  window.authPractice = Object.freeze({
    createHttpEvidence,
    practiceErrorMessage,
    setNotice
  });
})();
