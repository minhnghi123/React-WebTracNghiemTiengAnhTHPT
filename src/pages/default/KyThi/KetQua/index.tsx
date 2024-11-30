import { Result, ResultAPI } from "@/services/student";
import { Button, Table } from "antd";

import { useEffect, useState } from "react";

import ChiTietKetQua from "./ChiTietKetQua";
type KetQuaProps = {
  DeThi?: string;
};

export const KetQua: React.FC<KetQuaProps> = ({ DeThi }) => {
  const [Detail, setDetail] = useState<Result>();
  const [isDetail, setIsDetail] = useState(false);
  //const { user } = useAuthContext();
  const [result, setResult] = useState<Result[]>([]);

  const fethAllResult = async () => {
    const fetchAllResult = await ResultAPI.getAllResult(1);
    if (fetchAllResult.code === 200) {
      let filteredResult = fetchAllResult.data;

      if (DeThi) {
        filteredResult = filteredResult.filter(
          (item: { examId: { _id: string } }) => item.examId?._id === DeThi
        );
      }
      filteredResult.map((item: Result) => {
        console.log(item.examId);
      });
      setResult(filteredResult);
      console.log(filteredResult); // Hiển thị dữ liệu sau khi lọc
    }
  };

  useEffect(() => {
    fethAllResult();
  }, []);
  const columns = [
    {
      title: "Tên kỳ thi",
      dataIndex: ["examId", "title"],
      key: "examTitle",
    },
    {
      title: "Điểm",

      key: "score",
      render: (record: Result) =>
        ((record.score / record.questions.length) * 10).toFixed(2),
    },
    {
      title: "Số câu hỏi",
      dataIndex: "questions",
      key: "questions",
      render: (questions: any[]) => questions.length,
    },
    {
      title: "",
      key: "action",
      render: (record: Result) => (
        <Button
          onClick={() => {
            console.log(record);
            setDetail(record), setIsDetail(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];
  return (
    <div>
      <center>
        <h2>Danh sách các kết quả của các kỳ thi</h2>
      </center>
      {isDetail && Detail !== undefined ? (
        <div>
          <center>
            <Button onClick={() => setIsDetail(false)}>
              {" "}
              Quay về danh sách
            </Button>
          </center>
          <ChiTietKetQua result={Detail} />
        </div>
      ) : (
        <Table
          style={{ width: "80%", margin: "auto" }}
          columns={columns}
          dataSource={result}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};
