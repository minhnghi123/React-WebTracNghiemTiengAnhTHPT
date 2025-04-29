import { useEffect } from "react";

const usePreventDevTools = (onViolation?: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isDevToolKey =
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          (event.key === "I" || event.key === "C" || event.key === "J")) ||
        (event.ctrlKey && event.key === "U");

      if (isDevToolKey) {
        event.preventDefault();
        alert("Chức năng này bị vô hiệu hóa!");
        if (onViolation) onViolation(); // Chỉ gọi khi thực sự vi phạm
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      alert("Chức năng chuột phải bị vô hiệu hóa!");
      if (onViolation) onViolation();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onViolation]);
};

export default usePreventDevTools;
