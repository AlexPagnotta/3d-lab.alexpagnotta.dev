import { useEffect } from "react";

/**
 * Disables the overscroll behavior on the page.
 */
export const useDisableOverscroll = () => {
  useEffect(() => {
    document.documentElement.style.setProperty("overscroll-behavior", "none");
    document.body.style.setProperty("overscroll-behavior", "none");
    return () => {
      document.documentElement.style.removeProperty("overscroll-behavior");
      document.body.style.removeProperty("overscroll-behavior");
    };
  }, []);
};
