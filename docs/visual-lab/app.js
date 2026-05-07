const state = {
  selectedTopicId: null,
  selectedFocusFlowId: null,
  selectedStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  playbackTimerId: null,
};

const playbackBaseDelay = 2200;
const svgNamespace = "http://www.w3.org/2000/svg";
const keywordRoleNames = [
  "default",
  "client",
  "server",
  "http",
  "api",
  "data",
  "json",
  "db",
  "response",
  "code",
  "error",
  "warning",
];

const dom = {
  topicGrid: document.getElementById("topicGrid"),
  detailTitle: document.getElementById("detailTitle"),
  detailEnglishTitle: document.getElementById("detailEnglishTitle"),
  detailCategory: document.getElementById("detailCategory"),
  detailDescription: document.getElementById("detailDescription"),
  detailWhy: document.getElementById("detailWhy"),
  transformList: document.getElementById("transformList"),
  pointList: document.getElementById("pointList"),
  exampleRequest: document.getElementById("exampleRequest"),
  exampleResponse: document.getElementById("exampleResponse"),
  relatedDocs: document.getElementById("relatedDocs"),
  relatedCode: document.getElementById("relatedCode"),
  focusFlowTabs: document.getElementById("focusFlowTabs"),
  stepRail: document.getElementById("stepRail"),
  architectureDiagram: document.getElementById("architectureDiagram"),
  architectureCaption: document.getElementById("architectureCaption"),
  overviewSnapshot: document.getElementById("overviewSnapshot"),
  currentStepSummary: document.getElementById("currentStepSummary"),
  currentStepExample: document.getElementById("currentStepExample"),
  currentStepExampleResult: document.getElementById("currentStepExampleResult"),
  stepStage: document.getElementById("stepStage"),
  currentStepMeta: document.getElementById("currentStepMeta"),
  currentStepTitle: document.getElementById("currentStepTitle"),
  currentStepDescription: document.getElementById("currentStepDescription"),
  currentStepInput: document.getElementById("currentStepInput"),
  currentStepOutput: document.getElementById("currentStepOutput"),
  currentStepHandoff: document.getElementById("currentStepHandoff"),
  currentStepSource: document.getElementById("currentStepSource"),
  prevStepButton: document.getElementById("prevStepButton"),
  nextStepButton: document.getElementById("nextStepButton"),
  stepProgress: document.getElementById("stepProgress"),
  stepProgressFill: document.getElementById("stepProgressFill"),
  playStepButton: document.getElementById("playStepButton"),
  speedButtons: document.querySelectorAll(".step-speed-button"),
};

function hasTopics() {
  return getTopics().length > 0;
}

function getTopics() {
  if (Array.isArray(window.visualLabTopics)) {
    return window.visualLabTopics;
  }

  if (typeof visualLabTopics !== "undefined" && Array.isArray(visualLabTopics)) {
    return visualLabTopics;
  }

  return [];
}

function getFocusFlows() {
  if (Array.isArray(window.visualLabFocusFlows)) {
    return window.visualLabFocusFlows;
  }

  if (typeof visualLabFocusFlows !== "undefined" && Array.isArray(visualLabFocusFlows)) {
    return visualLabFocusFlows;
  }

  return [];
}

function createEmptyState(message) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  return empty;
}

function clearElement(element) {
  if (!element) {
    return;
  }

  element.replaceChildren();
}

function formatJson(value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function formatStepLabel(step, index) {
  const stepNumber = String(step.order || index + 1).padStart(2, "0");
  return `${stepNumber} ${displayTerm(step.label || "Step")}`;
}

function truncateText(value, maxLength) {
  const text = String(value || "");

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(svgNamespace, tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  return element;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function sanitizeId(value) {
  return String(value || "default").replace(/[^a-zA-Z0-9_-]/g, "-");
}

function getActorRole(type) {
  const roleMap = {
    user: "client",
    client: "client",
    browser: "client",
    postman: "client",
    server: "server",
    cloud: "server",
    controller: "process",
    service: "process",
    route: "process",
    function: "process",
    data: "data",
    json: "data",
    body: "data",
    response: "response",
    repository: "storage",
    database: "storage",
    folder: "storage",
    git: "storage",
    error: "error",
    warning: "warning",
  };

  return roleMap[type] || "data";
}

function displayTerm(value) {
  const aliases = {
    "HTTP Request": "Request",
    "HTTP Response": "Response",
    "Response Body": "Body",
    "Request Body": "Body",
    "JSON Response": "JSON",
    "JSON Body": "JSON",
    "API Endpoint": "Endpoint",
    "Server Function": "Server",
    "Controller Preview": "Controller",
    "Service Preview": "Service",
    "Data Preview": "Data",
    "Remote Repository": "Remote",
    "Local Folder": "Local",
    "Function A": "Func A",
    "Function B": "Func B",
  };

  return aliases[value] || value;
}

function getKeywordRole(value) {
  const text = String(value || "").toLowerCase();

  if (text.includes("client") || text.includes("browser") || text.includes("postman") || text.includes("user") || text.includes("swagger")) return "client";
  if (text.includes("server") || text.includes("cloud") || text.includes("network")) return "server";
  if (text.includes("http") || text.includes("method") || text.includes("url") || text.includes("status")) return "http";
  if (text.includes("api") || text.includes("endpoint") || text.includes("route") || text.includes("controller") || text.includes("service")) return "api";
  if (text.includes("dto")) return "data";
  if (text.includes("json")) return "json";
  if (text.includes("data") || text.includes("body") || text.includes("payload")) return "data";
  if (text.includes("db") || text.includes("database") || text.includes("repository") || text.includes("storage") || text.includes("memory") || text.includes("file") || text.includes("git")) return "db";
  if (text.includes("response") || text.includes("output") || text.includes("return") || text.includes("result")) return "response";
  if (text.includes("function") || text.includes("package") || text.includes("module") || text.includes("code")) return "code";
  if (text.includes("error") || text.includes("exception") || text.includes("404") || text.includes("400") || text.includes("500")) return "error";
  if (text.includes("warning") || text.includes("caution")) return "warning";

  return "default";
}

function addKeywordClass(element, value, fallbackRole) {
  if (!element || !element.classList) {
    return;
  }

  keywordRoleNames.forEach((role) => element.classList.remove(`keyword-${role}`));
  element.classList.add(`keyword-${fallbackRole || getKeywordRole(value)}`);
}

function getFlowLabels(topic) {
  return Array.isArray(topic.flow) ? topic.flow.map(displayTerm) : [];
}

function getStepSummary(step) {
  if (!step) {
    return [];
  }

  return [{
    from: step.input,
    to: step.output,
    description: step.handoff,
  }];
}

function getCurrentStepExample(flow, step) {
  if (step && step.example) {
    return step.example;
  }

  if (flow && flow.exampleRequest) {
    return flow.exampleRequest;
  }

  return null;
}

function getTopicResultExample(flow, step) {
  if (step && step.output) {
    return {
      결과: step.output,
      다음: step.handoff,
    };
  }

  if (flow && flow.exampleResponse) {
    return flow.exampleResponse;
  }

  return null;
}

function getStepPayload(step) {
  if (!step) {
    return "";
  }

  return step.payload || step.output || step.handoff || step.label || "";
}

function getTopicActors(flow) {
  if (flow && Array.isArray(flow.actors) && flow.actors.length) {
    return flow.actors;
  }

  return [
    { id: "client", label: "Client", type: "client" },
    { id: "server", label: "Server", type: "server" },
  ];
}

function getActorLabel(flow, actorId) {
  const actor = getTopicActors(flow).find((item) => item.id === actorId);
  return actor ? actor.label : displayTerm(actorId);
}

function getCurrentStep(flow) {
  return getFocusFlowSteps(flow)[state.selectedStepIndex];
}

function getArchitecturePath(step, actorPositions, pairOffsets) {
  const actorCenterY = 76;
  const baseY = actorCenterY;
  const fromX = actorPositions.get(step.from);
  const toX = actorPositions.get(step.to);

  if (fromX === undefined || toX === undefined) {
    return null;
  }

  if (fromX === toX) {
    const loopOffset = pairOffsets || 0;
    const y = baseY + loopOffset;
    return `M ${fromX} ${y} C ${fromX + 88} ${y - 62}, ${fromX - 88} ${y - 62}, ${fromX} ${y}`;
  }

  const direction = Math.sign(toX - fromX) || 1;
  const startX = fromX;
  const endX = toX;
  const offsetY = pairOffsets || 0;
  const y = baseY + offsetY;

  return `M ${startX} ${y} C ${startX + direction * 96} ${y}, ${endX - direction * 96} ${y}, ${endX} ${y}`;
}

function getPairOffsets(steps) {
  const pairTotals = new Map();
  const pairSeen = new Map();
  const offsets = new Map();

  steps.forEach((step) => {
    const pairKey = [step.from, step.to].sort().join("<->");
    pairTotals.set(pairKey, (pairTotals.get(pairKey) || 0) + 1);
  });

  steps.forEach((step, index) => {
    const pairKey = [step.from, step.to].sort().join("<->");
    const total = pairTotals.get(pairKey) || 1;
    const pairIndex = pairSeen.get(pairKey) || 0;
    const pairOffset = (pairIndex - (total - 1) / 2) * 24;
    const directionOffset = step.from !== step.to
      ? (step.from < step.to ? 14 : -14)
      : 0;
    offsets.set(index, pairOffset + directionOffset);
    pairSeen.set(pairKey, pairIndex + 1);
  });

  return offsets;
}

function renderTopicCards() {
  if (!dom.topicGrid) {
    return;
  }

  const topics = getTopics();
  clearElement(dom.topicGrid);

  if (!topics.length) {
    dom.topicGrid.appendChild(createEmptyState("주제가 없습니다."));
    return;
  }

  topics.forEach((topic) => {
    const card = document.createElement("button");
    const isSelected = topic.id === state.selectedTopicId;
    card.type = "button";
    card.className = `topic-card${isSelected ? " is-selected" : ""}`;
    card.setAttribute("aria-pressed", String(isSelected));
    card.dataset.topicId = topic.id;

    const badgeRow = document.createElement("div");
    badgeRow.className = "topic-card-mini-flow";

    const category = document.createElement("span");
    category.className = "topic-badge";
    category.textContent = topic.category || "Topic";
    addKeywordClass(category, topic.category || topic.title);

    const sequence = document.createElement("span");
    sequence.className = "sequence-badge";
    sequence.textContent = `Sequence ${topic.sequence || "00"}`;

    badgeRow.append(category, sequence);

    const title = document.createElement("h3");
    title.textContent = topic.title || "제목 없음";

    const description = document.createElement("p");
    description.textContent = topic.shortDescription || "준비 중입니다.";

    const miniFlow = document.createElement("div");
    miniFlow.className = "topic-card-mini-flow";
    getFlowLabels(topic).slice(0, 2).forEach((step) => {
      const stepBadge = document.createElement("span");
      stepBadge.className = "topic-badge";
      stepBadge.textContent = step;
      addKeywordClass(stepBadge, step);
      miniFlow.appendChild(stepBadge);
    });

    card.append(badgeRow, title, description, miniFlow);
    card.addEventListener("click", () => selectTopic(topic.id));
    dom.topicGrid.appendChild(card);
  });
}

function renderTopicDetail(topic) {
  if (!topic) {
    return;
  }

  if (dom.detailTitle) dom.detailTitle.textContent = topic.title || "";
  if (dom.detailEnglishTitle) dom.detailEnglishTitle.textContent = topic.englishTitle || "";
  if (dom.detailCategory) {
    dom.detailCategory.textContent = topic.category || "";
    addKeywordClass(dom.detailCategory, topic.category || topic.title);
  }
  if (dom.detailDescription) dom.detailDescription.textContent = topic.shortDescription || "";
  if (dom.detailWhy) dom.detailWhy.textContent = topic.whyItMatters || "";

  renderPoints(topic.points);
  renderRelatedLinks(topic);
}

function buildFallbackSteps(flow) {
  const labels = Array.isArray(flow.flow) ? flow.flow : [];

  return labels.map((label, index) => ({
    order: index + 1,
    label,
    title: `${label} 단계`,
    description: "앞 단계의 결과를 받아 다음으로 넘깁니다.",
    input: index === 0 ? "학습자가 시작한 행동" : labels[index - 1],
    output: label,
    handoff: index < labels.length - 1 ? `${labels[index + 1]}로 이동합니다.` : "흐름을 마칩니다.",
  }));
}

function getFocusFlowSteps(flow) {
  if (!flow) {
    return [];
  }

  if (Array.isArray(flow.steps) && flow.steps.length) {
    return flow.steps;
  }

  return buildFallbackSteps(flow);
}

function getSelectedTopic() {
  const topics = getTopics();
  return topics.find((item) => item.id === state.selectedTopicId) || topics[0];
}

function getSelectedFocusFlow() {
  const flows = getFocusFlows();
  return flows.find((item) => item.id === state.selectedFocusFlowId) || flows[0];
}

function clampStepIndex(index, total) {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, total - 1));
}

function renderFocusFlowTabs() {
  if (!dom.focusFlowTabs) {
    return;
  }

  const flows = getFocusFlows();
  clearElement(dom.focusFlowTabs);

  if (!flows.length) {
    dom.focusFlowTabs.appendChild(createEmptyState("핵심 흐름 준비 중입니다."));
    return;
  }

  flows.slice(0, 2).forEach((flow) => {
    const button = document.createElement("button");
    const isActive = flow.id === state.selectedFocusFlowId;
    button.type = "button";
    button.className = `focus-flow-tab${isActive ? " is-active" : ""}`;
    button.setAttribute("aria-pressed", String(isActive));
    button.textContent = flow.title || "핵심 흐름";
    button.addEventListener("click", () => selectFocusFlow(flow.id));
    dom.focusFlowTabs.appendChild(button);
  });
}

function renderStepExplorer(flow) {
  const steps = getFocusFlowSteps(flow);

  if (!steps.length) {
    renderStepRail([]);
    renderCurrentStep(null, 0, 0);
    renderArchitectureDiagram(flow);
    renderCurrentStepSummary(null, flow);
    renderOverviewSnapshot(flow);
    renderCurrentStepExamples(null, flow);
    renderPlaybackState(0);
    return;
  }

  state.selectedStepIndex = clampStepIndex(state.selectedStepIndex, steps.length);
  renderStepRail(steps);
  renderArchitectureDiagram(flow);
  renderCurrentStep(steps[state.selectedStepIndex], state.selectedStepIndex, steps.length);
  renderCurrentStepSummary(steps[state.selectedStepIndex], flow);
  renderOverviewSnapshot(flow);
  renderPlaybackState(steps.length);
  renderCurrentStepExamples(steps[state.selectedStepIndex], flow);
}

function createActorIcon(type) {
  const icon = document.createElement("span");
  icon.className = "architecture-actor-icon";
  const svg = createSvgElement("svg", {
    viewBox: "0 0 48 48",
    "aria-hidden": "true",
  });
  const iconPaths = {
    client: [
      ["rect", { x: 9, y: 10, width: 30, height: 21, rx: 4 }],
      ["path", { d: "M18 38h12M24 31v7" }],
    ],
    server: [
      ["path", { d: "M16 31h21a8 8 0 0 0 0-16 11 11 0 0 0-21-3 9 9 0 0 0 0 19z" }],
    ],
    controller: [
      ["path", { d: "M10 16h18a7 7 0 0 1 7 7v0a7 7 0 0 1-7 7H16" }],
      ["path", { d: "M16 10l-6 6 6 6M32 26l6 6-6 6" }],
    ],
    service: [
      ["circle", { cx: 24, cy: 24, r: 8 }],
      ["path", { d: "M24 6v7M24 35v7M6 24h7M35 24h7M11 11l5 5M32 32l5 5M37 11l-5 5M16 32l-5 5" }],
    ],
    repository: [
      ["rect", { x: 11, y: 12, width: 26, height: 24, rx: 5 }],
      ["path", { d: "M16 18h16M16 24h16M16 30h10" }],
    ],
    database: [
      ["ellipse", { cx: 24, cy: 12, rx: 14, ry: 6 }],
      ["path", { d: "M10 12v22c0 3 6 6 14 6s14-3 14-6V12" }],
      ["path", { d: "M10 23c0 3 6 6 14 6s14-3 14-6" }],
    ],
    response: [
      ["path", { d: "M11 13h26v22H11z" }],
      ["path", { d: "M16 20h16M16 26h10M30 31l5 4 5-8" }],
    ],
    user: [
      ["circle", { cx: 24, cy: 16, r: 7 }],
      ["path", { d: "M12 39c2-8 7-12 12-12s10 4 12 12" }],
    ],
    json: [
      ["path", { d: "M15 8h13l7 7v25H15z" }],
      ["path", { d: "M28 8v8h7M21 24l-4 4 4 4M27 24l4 4-4 4" }],
    ],
    git: [
      ["circle", { cx: 15, cy: 15, r: 5 }],
      ["circle", { cx: 33, cy: 33, r: 5 }],
      ["circle", { cx: 33, cy: 15, r: 5 }],
      ["path", { d: "M20 15h8M18 19l11 11" }],
    ],
    folder: [
      ["path", { d: "M8 16h13l4 5h15v17H8z" }],
      ["path", { d: "M8 16v-5h12l4 5" }],
    ],
    route: [
      ["path", { d: "M10 14h11a7 7 0 0 1 0 14h-1a7 7 0 0 0 0 14h18" }],
      ["circle", { cx: 10, cy: 14, r: 4 }],
      ["circle", { cx: 38, cy: 42, r: 4 }],
    ],
    data: [
      ["rect", { x: 9, y: 11, width: 30, height: 26, rx: 6 }],
      ["path", { d: "M16 19h16M16 25h11M16 31h16" }],
    ],
  };
  const shapes = iconPaths[type] || iconPaths.data;

  shapes.forEach(([tagName, attributes]) => {
    svg.appendChild(createSvgElement(tagName, attributes));
  });

  icon.appendChild(svg);
  return icon;
}

function renderArchitectureDiagram(flow) {
  if (!dom.architectureDiagram) {
    return;
  }

  const actors = getTopicActors(flow);
  const steps = getFocusFlowSteps(flow);
  const currentStep = getCurrentStep(flow);
  clearElement(dom.architectureDiagram);

  if (dom.architectureCaption) {
    dom.architectureCaption.textContent = currentStep
      ? `${getActorLabel(flow, currentStep.from)} -> ${getActorLabel(flow, currentStep.to)} · ${truncateText(currentStep.payload || currentStep.message || getStepPayload(currentStep), 34)}`
      : "";
  }

  if (!actors.length || !steps.length) {
    dom.architectureDiagram.appendChild(createEmptyState("그림 준비 중입니다."));
    return;
  }

  const actorGap = 240;
  const startX = 76;
  const actorY = 28;
  const width = Math.max(720, startX * 2 + actorGap * (actors.length - 1));
  const height = 230;
  const actorPositions = new Map(actors.map((actor, index) => [actor.id, startX + actorGap * index]));
  const pairOffsets = getPairOffsets(steps);
  const markerId = `architectureArrowHead-${sanitizeId(flow && flow.id)}`;
  const stage = document.createElement("div");
  stage.className = "architecture-stage";
  stage.style.width = `${width}px`;
  const svg = createSvgElement("svg", {
    class: "architecture-link-layer",
    viewBox: `0 0 ${width} ${height}`,
    "aria-hidden": "true",
  });
  const defs = createSvgElement("defs");
  const marker = createSvgElement("marker", {
    id: markerId,
    markerWidth: "10",
    markerHeight: "10",
    refX: "8",
    refY: "5",
    orient: "auto-start-reverse",
  });
  marker.appendChild(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "architecture-arrow-head" }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const linkGroups = [];

  steps.forEach((step, index) => {
    const isActive = step === currentStep;
    const isComplete = index < state.selectedStepIndex;
    const path = getArchitecturePath(step, actorPositions, pairOffsets.get(index) || 0);

    if (!path) {
      return;
    }

    const linkGroup = createSvgElement("g", {
      class: `architecture-link${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`,
    });
    const link = createSvgElement("path", {
      d: path,
      "marker-end": `url(#${markerId})`,
    });
    linkGroup.appendChild(link);

    if (isActive) {
      const payload = createSvgElement("g", {
        class: "architecture-payload is-animating",
      });
      const rect = createSvgElement("rect", { x: "-38", y: "-12", width: "76", height: "24", rx: "12" });
      const text = createSvgElement("text", { x: "0", y: "4", "text-anchor": "middle" });
      text.textContent = truncateText(step.payload || step.message || getStepPayload(step), 12);
      const motion = createSvgElement("animateMotion", {
        dur: state.isPlaying ? `${getPlaybackDelay()}ms` : "1400ms",
        repeatCount: state.isPlaying && !prefersReducedMotion() ? "indefinite" : "1",
        path,
      });
      const fade = createSvgElement("animate", {
        attributeName: "opacity",
        values: state.isPlaying && !prefersReducedMotion() ? "0;1;1;0;0" : "0;1;1;0",
        keyTimes: state.isPlaying && !prefersReducedMotion() ? "0;0.16;0.74;0.94;1" : "0;0.18;0.72;1",
        dur: state.isPlaying ? `${getPlaybackDelay()}ms` : "1400ms",
        repeatCount: state.isPlaying && !prefersReducedMotion() ? "indefinite" : "1",
        fill: "freeze",
      });
      payload.append(rect, text, motion, fade);
      linkGroup.appendChild(payload);
    }

    linkGroups.push({ element: linkGroup, isActive });
  });

  linkGroups
    .filter((item) => !item.isActive)
    .forEach((item) => svg.appendChild(item.element));
  linkGroups
    .filter((item) => item.isActive)
    .forEach((item) => svg.appendChild(item.element));

  stage.appendChild(svg);

  actors.forEach((actor) => {
    const x = actorPositions.get(actor.id);
    const node = document.createElement("div");
    const isFrom = currentStep && currentStep.from === actor.id;
    const isTo = currentStep && currentStep.to === actor.id;
    node.className = `architecture-actor role-${getActorRole(actor.type)}${isFrom ? " is-from" : ""}${isTo ? " is-to" : ""}`;
    node.style.left = `${x - 48}px`;
    node.style.top = `${actorY}px`;

    const label = document.createElement("span");
    label.className = "architecture-actor-label";
    label.textContent = actor.label;

    node.append(createActorIcon(actor.type), label);
    stage.appendChild(node);
  });

  dom.architectureDiagram.appendChild(stage);
}

function renderStepRail(steps) {
  if (!dom.stepRail) {
    return;
  }

  clearElement(dom.stepRail);

  if (!Array.isArray(steps) || !steps.length) {
    dom.stepRail.appendChild(createEmptyState("단계 준비 중입니다."));
    return;
  }

  steps.forEach((step, index) => {
    const button = document.createElement("button");
    const isActive = index === state.selectedStepIndex;
    button.type = "button";
    button.className = `step-rail-button${index < state.selectedStepIndex ? " is-complete" : ""}${isActive ? " is-active" : ""}`;
    addKeywordClass(button, step.label || step.message || step.payload);
    button.setAttribute("aria-pressed", String(isActive));
    button.textContent = truncateText(formatStepLabel(step, index), 18);
    button.addEventListener("click", () => selectStep(index));

    dom.stepRail.appendChild(button);
  });
}

function renderStepSource(step) {
  if (!dom.currentStepSource) {
    return;
  }

  clearElement(dom.currentStepSource);

  if (!step || !step.sourceUrl) {
    dom.currentStepSource.hidden = true;
    return;
  }

  dom.currentStepSource.hidden = false;

  if (step.sourceUrl) {
    const anchor = document.createElement("a");
    anchor.className = "step-source-link";
    anchor.href = step.sourceUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = step.sourceLabel || "자료 열기";
    dom.currentStepSource.appendChild(anchor);
  }
}

function renderCurrentStep(step, index, total) {
  if (dom.stepStage) {
    dom.stepStage.classList.remove("is-entering");
    void dom.stepStage.offsetWidth;
    dom.stepStage.classList.add("is-entering");
  }

  if (!step) {
    if (dom.currentStepMeta) dom.currentStepMeta.textContent = "";
    if (dom.currentStepTitle) dom.currentStepTitle.textContent = "준비 중입니다.";
    if (dom.currentStepDescription) dom.currentStepDescription.textContent = "";
    if (dom.currentStepInput) dom.currentStepInput.textContent = "";
    if (dom.currentStepOutput) dom.currentStepOutput.textContent = "";
    if (dom.currentStepHandoff) dom.currentStepHandoff.textContent = "";
    if (dom.stepProgress) dom.stepProgress.textContent = "0 / 0";
    if (dom.prevStepButton) dom.prevStepButton.disabled = true;
    if (dom.nextStepButton) dom.nextStepButton.disabled = true;
    if (dom.stepProgressFill) dom.stepProgressFill.style.width = "0%";
    renderStepSource(null);
    return;
  }

  const order = String(step.order || index + 1).padStart(2, "0");

  if (dom.currentStepMeta) dom.currentStepMeta.textContent = `${order} / ${String(total).padStart(2, "0")} · ${displayTerm(step.label || "Step")}`;
  if (dom.currentStepTitle) dom.currentStepTitle.textContent = step.title || step.label || "단계 설명";
  if (dom.currentStepDescription) dom.currentStepDescription.textContent = step.description || "";
  if (dom.currentStepInput) dom.currentStepInput.textContent = step.input || "이전 결과";
  if (dom.currentStepOutput) dom.currentStepOutput.textContent = step.output || "다음 결과";
  if (dom.currentStepHandoff) dom.currentStepHandoff.textContent = step.handoff || "다음으로 이동";
  addKeywordClass(dom.currentStepInput && dom.currentStepInput.parentElement, step.input || step.label, "client");
  addKeywordClass(dom.currentStepOutput && dom.currentStepOutput.parentElement, step.output || step.payload, "response");
  addKeywordClass(dom.currentStepHandoff && dom.currentStepHandoff.parentElement, step.handoff || step.message, "data");
  if (dom.stepProgress) dom.stepProgress.textContent = `${index + 1} / ${total}`;
  if (dom.stepProgressFill) dom.stepProgressFill.style.width = `${((index + 1) / total) * 100}%`;
  if (dom.prevStepButton) dom.prevStepButton.disabled = index === 0;
  if (dom.nextStepButton) dom.nextStepButton.disabled = index === total - 1;

  renderStepSource(step);
}

function renderOverviewSnapshot(flow) {
  if (!dom.overviewSnapshot) {
    return;
  }

  const steps = getFocusFlowSteps(flow);
  const currentStep = getCurrentStep(flow);
  const startActor = currentStep ? getActorLabel(flow, currentStep.from) : "-";
  const endActor = currentStep ? getActorLabel(flow, currentStep.to) : "-";
  const currentSummary = currentStep ? currentStep.summary || currentStep.message || currentStep.output : "-";
  clearElement(dom.overviewSnapshot);

  const grid = document.createElement("div");
  grid.className = "snapshot-grid";
  [
    ["단계", steps.length ? `${state.selectedStepIndex + 1} / ${steps.length}` : "0 / 0"],
    ["시작", startActor],
    ["종료", endActor],
    ["현재", currentSummary],
  ].forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "snapshot-item";
    addKeywordClass(item, value);
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const valueEl = document.createElement("strong");
    valueEl.textContent = value;
    item.append(labelEl, valueEl);
    grid.appendChild(item);
  });

  dom.overviewSnapshot.appendChild(grid);
}

function renderCurrentStepSummary(step, flow) {
  if (!dom.currentStepSummary) {
    return;
  }

  clearElement(dom.currentStepSummary);

  if (!step) {
    dom.currentStepSummary.appendChild(createEmptyState("요약 준비 중입니다."));
    return;
  }

  const header = document.createElement("div");
  header.className = "step-summary-header";
  const title = document.createElement("strong");
  title.textContent = step.summary || step.message || step.title || "현재 단계";
  const route = document.createElement("span");
  route.textContent = `${getActorLabel(flow, step.from)} -> ${getActorLabel(flow, step.to)}`;
  addKeywordClass(route, `${step.from} ${step.to}`);
  header.append(title, route);

  const grid = document.createElement("div");
  grid.className = "step-summary-grid";
  [
    ["메시지", step.message || step.payload || step.output],
    ["Payload", step.payload || step.output],
    ["입력", step.input],
    ["결과", step.output],
  ].forEach(([label, value]) => {
    if (!value) {
      return;
    }

    const item = document.createElement("div");
    item.className = "snapshot-item";
    addKeywordClass(item, `${label} ${value}`);
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const valueEl = document.createElement("strong");
    valueEl.textContent = value;
    item.append(labelEl, valueEl);
    grid.appendChild(item);
  });

  dom.currentStepSummary.append(header, grid);
}

function renderCurrentStepExamples(step, flow) {
  if (dom.currentStepExample) {
    dom.currentStepExample.textContent = formatJson(step && step.exampleRequest !== undefined ? step.exampleRequest : getCurrentStepExample(flow, step)) || "예시 준비 중입니다.";
  }

  if (dom.currentStepExampleResult) {
    dom.currentStepExampleResult.textContent = formatJson(step && step.exampleResponse !== undefined ? step.exampleResponse : getTopicResultExample(flow, step)) || "결과 준비 중입니다.";
  }
}

function selectStep(index) {
  const flow = getSelectedFocusFlow();
  const steps = getFocusFlowSteps(flow);

  if (!steps.length) {
    return;
  }

  pauseStepLoop();
  state.selectedStepIndex = clampStepIndex(index, steps.length);
  renderStepExplorer(flow);
}

function goToPrevStep() {
  pauseStepLoop();
  selectStep(state.selectedStepIndex - 1);
}

function goToNextStep() {
  pauseStepLoop();
  selectStep(state.selectedStepIndex + 1);
}

function getPlaybackDelay() {
  return playbackBaseDelay / state.playbackSpeed;
}

function refreshArchitectureDiagram() {
  renderArchitectureDiagram(getSelectedFocusFlow());
}

function advanceStepForPlayback() {
  const flow = getSelectedFocusFlow();
  const steps = getFocusFlowSteps(flow);

  if (!steps.length || state.selectedStepIndex >= steps.length - 1) {
    pauseStepLoop();
    return;
  }

  state.selectedStepIndex += 1;
  renderStepExplorer(flow);

  if (state.selectedStepIndex >= steps.length - 1) {
    pauseStepLoop();
    return;
  }

  schedulePlayback();
}

function schedulePlayback() {
  window.clearTimeout(state.playbackTimerId);

  if (!state.isPlaying) {
    return;
  }

  state.playbackTimerId = window.setTimeout(advanceStepForPlayback, getPlaybackDelay());
}

function playStepLoop() {
  const flow = getSelectedFocusFlow();
  const steps = getFocusFlowSteps(flow);

  if (!steps.length) {
    return;
  }

  if (state.selectedStepIndex >= steps.length - 1) {
    state.selectedStepIndex = 0;
    renderStepExplorer(flow);
  }

  state.isPlaying = true;
  renderPlaybackState(steps.length);
  refreshArchitectureDiagram();
  schedulePlayback();
}

function pauseStepLoop() {
  state.isPlaying = false;
  window.clearTimeout(state.playbackTimerId);
  renderPlaybackState(getFocusFlowSteps(getSelectedFocusFlow()).length);
  refreshArchitectureDiagram();
}

function toggleStepPlayback() {
  if (state.isPlaying) {
    pauseStepLoop();
    return;
  }

  playStepLoop();
}

function setPlaybackSpeed(speed) {
  state.playbackSpeed = speed;
  renderPlaybackState(getFocusFlowSteps(getSelectedFocusFlow()).length);
  refreshArchitectureDiagram();

  if (state.isPlaying) {
    schedulePlayback();
  }
}

function renderPlaybackState(total) {
  if (dom.playStepButton) {
    dom.playStepButton.textContent = state.isPlaying ? "일시정지" : "재생";
    dom.playStepButton.setAttribute("aria-pressed", String(state.isPlaying));
  }

  if (dom.stepStage) {
    dom.stepStage.classList.toggle("is-playing", state.isPlaying);
  }

  if (dom.speedButtons) {
    dom.speedButtons.forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.speed) === state.playbackSpeed);
    });
  }

  if (dom.stepProgressFill && total <= 0) {
    dom.stepProgressFill.style.width = "0%";
  }
}

function renderTransforms(transforms) {
  if (!dom.transformList) {
    return;
  }

  clearElement(dom.transformList);

  if (!Array.isArray(transforms) || !transforms.length) {
    dom.transformList.appendChild(createEmptyState("요약 준비 중입니다."));
    return;
  }

  transforms.forEach((item) => {
    const card = document.createElement("div");
    card.className = "transform-card";

    const title = document.createElement("strong");
    title.textContent = `${displayTerm(item.from || "Before")} -> ${displayTerm(item.to || "After")}`;

    const description = document.createElement("p");
    description.textContent = item.description || "";

    card.append(title, description);
    dom.transformList.appendChild(card);
  });
}

function renderPoints(points) {
  if (!dom.pointList) {
    return;
  }

  clearElement(dom.pointList);

  if (!Array.isArray(points) || !points.length) {
    dom.pointList.appendChild(createEmptyState("핵심 준비 중입니다."));
    return;
  }

  points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    dom.pointList.appendChild(item);
  });
}

function renderExamples(topic, step) {
  if (dom.exampleRequest) {
    dom.exampleRequest.textContent = formatJson(getCurrentStepExample(topic, step)) || "예시 준비 중입니다.";
  }

  if (dom.exampleResponse) {
    dom.exampleResponse.textContent = formatJson(getTopicResultExample(topic, step)) || "결과 준비 중입니다.";
  }
}

function renderLinkList(container, links, emptyMessage) {
  if (!container) {
    return;
  }

  clearElement(container);

  if (!Array.isArray(links) || !links.length) {
    container.appendChild(createEmptyState(emptyMessage));
    return;
  }

  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "related-link-card";
    anchor.href = link.url || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label || link.url || "자료";
    container.appendChild(anchor);
  });
}

function renderRelatedLinks(topic) {
  renderLinkList(dom.relatedDocs, topic.sourceDocs, "문서 준비 중입니다.");
  renderLinkList(dom.relatedCode, topic.sourceCode, "코드 준비 중입니다.");
}

function selectFocusFlow(flowId) {
  const flows = getFocusFlows();
  const flow = flows.find((item) => item.id === flowId) || flows[0];

  if (!flow) {
    return;
  }

  state.isPlaying = false;
  window.clearTimeout(state.playbackTimerId);
  state.selectedFocusFlowId = flow.id;
  state.selectedStepIndex = 0;
  renderFocusFlowTabs();
  renderStepExplorer(flow);
}

function selectTopic(topicId) {
  const topics = getTopics();
  const topic = topics.find((item) => item.id === topicId) || topics[0];

  if (!topic) {
    return;
  }

  state.selectedTopicId = topic.id;
  renderTopicCards();
  renderTopicDetail(topic);
}

function initVisualLab() {
  if (!dom.topicGrid) {
    return;
  }

  if (!hasTopics()) {
    dom.topicGrid.appendChild(createEmptyState("데이터가 없습니다."));
    return;
  }

  const firstTopic = getTopics()[0];
  selectTopic(firstTopic.id);
  selectFocusFlow((getFocusFlows()[0] || {}).id);

  if (dom.prevStepButton) {
    dom.prevStepButton.addEventListener("click", goToPrevStep);
  }

  if (dom.nextStepButton) {
    dom.nextStepButton.addEventListener("click", goToNextStep);
  }

  if (dom.playStepButton) {
    dom.playStepButton.addEventListener("click", toggleStepPlayback);
  }

  if (dom.speedButtons) {
    dom.speedButtons.forEach((button) => {
      button.addEventListener("click", () => setPlaybackSpeed(Number(button.dataset.speed) || 1));
    });
  }
}

document.addEventListener("DOMContentLoaded", initVisualLab);
