import { useEffect } from "react";

const usePreventDevTools = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Chặn các phím mở DevTools
      if (
        event.key === "F12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          (event.key === "I" || event.key === "C" || event.key === "J")) ||
        (event.ctrlKey && event.key === "U")
      ) {
        event.preventDefault();
        alert("Chức năng này bị vô hiệu hóa!");
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      alert("Chức năng chuột phải bị vô hiệu hóa!");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
};

export default usePreventDevTools;
