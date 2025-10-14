import { useEffect } from "react";

const usePreventDevTools = (onViolation: () => void) => {
  useEffect(() => {
    // Nếu onViolation là empty function, không làm gì cả (disabled)
    if (onViolation.toString().includes("{}")) {
      return;
    }

    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        onViolation();
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onViolation();
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        onViolation();
      }
    };

    window.addEventListener("resize", detectDevTools);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyboardShortcuts);

    const interval = setInterval(detectDevTools, 1000);

    return () => {
      window.removeEventListener("resize", detectDevTools);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyboardShortcuts);
      clearInterval(interval);
    };
  }, [onViolation]);
};

export default usePreventDevTools;
