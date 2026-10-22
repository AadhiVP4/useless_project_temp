// background.js — service worker
// Keeps extension alive; no state stored in variables (MV3 compliant).

chrome.runtime.onInstalled.addListener(() => {
  console.log("[Insta Conscience] Extension installed.");
});
