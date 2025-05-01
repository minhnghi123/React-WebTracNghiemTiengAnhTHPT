import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
export interface BlockInfo {
  code: number;
  blockedUntil: string;
  isBlocked: boolean;
}

const BlockPage = ({ info }: { info: BlockInfo }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="text-center">
        <h1 className="display-4 text-primary">
          Tài khoản của bạn bị khóa tạm thời do vi phạm quy chế thi.
          <hr />
          Vui lòng chờ đến thời gian kết thúc.
        </h1>
        <p className="lead">
  Cấm đến ngày:{" "}
  {new Date(info.blockedUntil).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}
</p>
      </div>
    </div>
  );
};

export default BlockPage;
