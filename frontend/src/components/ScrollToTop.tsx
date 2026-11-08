import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/*
 * Scrolls to the top of the page whenever the user moves to a new page.
 * Links that point to a section ("/#explore") are left alone, because
 * Home.tsx scrolls to that section itself.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;