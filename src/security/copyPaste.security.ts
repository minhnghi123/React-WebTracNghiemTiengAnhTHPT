import { useEffect } from "react";

const usePreventCopyPaste = (onViolation: () => void) => {
  useEffect(() => {
    // Nếu onViolation là empty function, không làm gì cả (disabled)
    if (onViolation.toString().includes("{}")) {
      return;
    }

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation();
    };

    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation();
    };

    const preventCut = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation();
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("paste", preventPaste);
    document.addEventListener("cut", preventCut);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventPaste);
      document.removeEventListener("cut", preventCut);
    };
  }, [onViolation]);
};

export default usePreventCopyPaste;
