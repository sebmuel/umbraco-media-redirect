import type { Page } from "./types";

const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);

async function applyRulesFromStorage() {
  const { ["config-storage"]: config } = await chrome.storage.local.get(["config-storage"]);

  await clearAllDynamicRules();

  if (!config || !Array.isArray(config?.state?.pages) || config.state.pages.length === 0) {
    console.log("No rules to apply (config empty).");
    return;
  }

  const rules = config.state.pages.map((page: Page, i: number) => ({
    id: i + 1,
    priority: 1,
    action: { type: "redirect", redirect: { regexSubstitution: `https://${page.url}\\1` } },
    condition: { regexFilter: `^https?://${page.title}(/media/.*)$`, resourceTypes: allResourceTypes },
  }));

  console.log("Applying rules:", rules);

  await chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules, removeRuleIds: [] });
}

chrome.runtime.onInstalled.addListener(applyRulesFromStorage);
chrome.runtime.onStartup.addListener(applyRulesFromStorage);

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local") return;
  if (changes["config-storage"]) {
    await applyRulesFromStorage();
  }
});

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  console.log("DNR matched:", info);
});

async function clearAllDynamicRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  if (existing.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existing.map((r) => r.id),
      addRules: [],
    });
  }
}
