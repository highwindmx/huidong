// 挥动 (fork of Gesturefy) action-menu: temporary disable / open settings / snap links
const STORAGE_KEY = "gfTempDisabled";
const SUBJECT = "gfSetTempDisabled";
const LS_KEY = "gfLinkSelector";
const LS_SUBJECT = "gfSetLinkSelector";
const LS_DEFAULTS = { enabled: true, modifier: "ctrlKey", mode: "background" };

const toggleButton = document.getElementById("toggle");
const settingsButton = document.getElementById("settings");
const stateLabel = document.getElementById("state");
const lsEnabled = document.getElementById("lsEnabled");
const lsModifier = document.getElementById("lsModifier");
const lsMode = document.getElementById("lsMode");

async function isDisabled () {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return Boolean(result[STORAGE_KEY]);
}

async function getLsConfig () {
  const result = await browser.storage.local.get(LS_KEY);
  return { ...LS_DEFAULTS, ...(result[LS_KEY] || {}) };
}

async function saveLsConfig (cfg) {
  await browser.storage.local.set({ [LS_KEY]: cfg });
  const tabs = await browser.tabs.query({});
  await Promise.all(tabs.map(tab =>
    browser.tabs.sendMessage(tab.id, { subject: LS_SUBJECT, data: cfg }).catch(() => {})
  ));
}

async function refresh () {
  const disabled = await isDisabled();
  toggleButton.textContent = disabled ? "恢复手势" : "暂时禁用手势";
  stateLabel.textContent = disabled
    ? "当前：已禁用（手势轨迹与动作均关闭）"
    : "当前：手势已启用";

  const cfg = await getLsConfig();
  lsEnabled.checked = Boolean(cfg.enabled);
  lsModifier.value = cfg.modifier;
  lsMode.value = cfg.mode;
}

async function broadcast (disabled) {
  const tabs = await browser.tabs.query({});
  await Promise.all(tabs.map(tab =>
    browser.tabs.sendMessage(tab.id, { subject: SUBJECT, data: disabled }).catch(() => {})
  ));
}

toggleButton.addEventListener("click", async () => {
  const disabled = await isDisabled();
  const next = !disabled;
  await browser.storage.local.set({ [STORAGE_KEY]: next });
  await broadcast(next);
  window.close();
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
