"use client";

import { useEffect, useState } from "react";

const TOOLS_NEW_TAB_KEY = "repetigo.toolsOpenInNewTab";
const CHANGE_EVENT = "repetigo:ui-prefs-changed";

function readToolsInNewTab() {
  try {
    return window.localStorage.getItem(TOOLS_NEW_TAB_KEY) === "1";
  } catch {
    return false;
  }
}

export function setToolsOpenInNewTab(value: boolean) {
  try {
    window.localStorage.setItem(TOOLS_NEW_TAB_KEY, value ? "1" : "0");
  } catch {
    // Storage blocked - the preference just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Dashboard-wide preference: open sidebar tools in a new browser tab.
// Defaults to false (same tab); stored per browser.
export function useToolsOpenInNewTab() {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const sync = () => setValue(readToolsInNewTab());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return value;
}
