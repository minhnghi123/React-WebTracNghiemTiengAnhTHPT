import { useEffect } from "react";

const usePreventCopyPaste = () => {
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Sao chép nội dung bị cấm!");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Dán nội dung bị cấm!");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("Cắt nội dung bị cấm!");
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);
};

export default usePreventCopyPaste;
