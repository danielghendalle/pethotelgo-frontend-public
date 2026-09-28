import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const getIsMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;

export function useIsMobile() {
  // Initialise synchronously so the first paint already matches the real
  // viewport — avoids a desktop->mobile layout flash on small screens.
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
