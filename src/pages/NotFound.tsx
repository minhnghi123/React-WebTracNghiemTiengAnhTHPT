const NotFound = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <span
        className="text-[192px] text-secondary"
        style={{
          textShadow: "0px 0px 44px hsla(var(--secondary), 0.35)",
        }}
      >
        404 không tìm thấy
      </span>
    </div>
  );
};

export default NotFound;
