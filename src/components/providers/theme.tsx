"use client";

import { useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "bolsillo:theme";

/** Script que se ejecuta antes del primer pintado para evitar parpadeo. */
export const themeScript = `(function(){try{var p=localStorage.getItem('${KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    let saved: ThemePref = "system";
    try {
      saved = (localStorage.getItem(KEY) as ThemePref) || "system";
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leer preferencia guardada tras hidratar
    setPref(saved);
  }, []);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const set = (p: ThemePref) => {
    setPref(p);
    try {
      localStorage.setItem(KEY, p);
    } catch {}
    apply(p);
  };

  return { pref, setTheme: set };
}
