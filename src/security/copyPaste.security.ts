import { useEffect } from "react";

const usePreventCopyPaste = (onViolation?: () => void) => {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Sao chép nội dung bị cấm!");
      if (onViolation) onViolation();
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Dán nội dung bị cấm!");
      if (onViolation) onViolation();
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Cắt nội dung bị cấm!");
      if (onViolation) onViolation();
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
    };
  }, [onViolation]);
};

export default usePreventCopyPaste;
