// 挥动 (fork of Gesturefy) action-menu: gesture toggle / snap links / settings
const STORAGE_KEY = "gfTempDisabled";
const SUBJECT = "gfSetTempDisabled";
const LS_KEY = "gfLinkSelector";
const LS_SUBJECT = "gfSetLinkSelector";
const LS_DEFAULTS = { enabled: true, modifier: "ctrlKey", mode: "background" };

const gestureEnabled = document.getElementById("gestureEnabled");
const gestureMouseButton = document.getElementById("gestureMouseButton");
const settingsButton = document.getElementById("settings");
const stateLabel = document.getElementById("state");
const lsEnabled = document.getElementById("lsEnabled");
const lsModifier = document.getElementById("lsModifier");
const lsMode = document.getElementById("lsMode");

async function isDisabled () {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return Boolean(result[STORAGE_KEY]);
}

async function getGestureMouseButton () {
  const result = await browser.storage.local.get("Settings");
  const button = result.Settings?.Gesture?.mouseButton;
  return [0, 1, 2].includes(button) ? button : 2;
}

async function setGestureMouseButton (value) {
  const result = await browser.storage.local.get("Settings");
  const settings = result.Settings || {};
  settings.Gesture = { ...(settings.Gesture || {}), mouseButton: Number(value) };
  await browser.storage.local.set({ Settings: settings });
}

async function getLsConfig () {
  const result = await browser.storage.local.get(LS_KEY);
  return { ...LS_DEFAULTS, ...(result[LS_KEY] || {}) };
}

async function saveLsConfig (cfg) {
  await browser.storage.local.set({ [LS_KEY]: cfg });
  await broadcastConfig(LS_SUBJECT, cfg);
}

async function broadcastConfig (subject, data) {
  const tabs = await browser.tabs.query({});
  await Promise.all(tabs.map(tab =>
    browser.tabs.sendMessage(tab.id, { subject: subject, data: data }).catch(() => {})
  ));
}

async function refresh () {
  const disabled = await isDisabled();
  gestureEnabled.checked = !disabled;
  stateLabel.textContent = disabled ? "当前：已禁用（手势轨迹与动作均关闭）" : "";
  stateLabel.hidden = !disabled;

  gestureMouseButton.value = String(await getGestureMouseButton());

  const cfg = await getLsConfig();
  lsEnabled.checked = Boolean(cfg.enabled);
  lsModifier.value = cfg.modifier;
  lsMode.value = cfg.mode;
}

// "启用手势"开关：checked 表示启用，存储的是相反的 disabled
gestureEnabled.addEventListener("change", async () => {
  const disabled = !gestureEnabled.checked;
  await browser.storage.local.set({ [STORAGE_KEY]: disabled });
  await broadcastConfig(SUBJECT, disabled);
  stateLabel.textContent = disabled ? "当前：已禁用（手势轨迹与动作均关闭）" : "";
  stateLabel.hidden = !disabled;
});

gestureMouseButton.addEventListener("change", () => {
  setGestureMouseButton(gestureMouseButton.value);
});

settingsButton.addEventListener("click", () => {
  browser.runtime.openOptionsPage();
  window.close();
});

lsEnabled.addEventListener("change", async () => {
  const cfg = await getLsConfig();
  cfg.enabled = lsEnabled.checked;
  await saveLsConfig(cfg);
});

lsModifier.addEventListener("change", async () => {
  const cfg = await getLsConfig();
  cfg.modifier = lsModifier.value;
  await saveLsConfig(cfg);
});

lsMode.addEventListener("change", async () => {
  const cfg = await getLsConfig();
  cfg.mode = lsMode.value;
  await saveLsConfig(cfg);
});

refresh();
