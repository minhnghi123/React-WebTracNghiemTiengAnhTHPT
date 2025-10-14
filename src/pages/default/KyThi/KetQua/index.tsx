import { Result, ResultAPI } from "@/services/student";
import { Button, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import ChiTietKetQua from "./ChiTietKetQua";

const { Title, Text: AntText } = Typography;

type KetQuaProps = {
  DeThi?: string;
};

export const KetQua: React.FC<KetQuaProps> = ({ DeThi }) => {
  const [detail, setDetail] = useState<Result>();
  const [isDetail, setIsDetail] = useState(false);
  const [result, setResult] = useState<Result[]>([]);

  const fetchAllResult = async () => {
    const res = await ResultAPI.getAllResult(1);
    if (res.code === 200) {
      let filtered = res.data;
      if (DeThi) {
        filtered = filtered.filter(
          (item: { examId: { _id: string } }) => item.examId?._id === DeThi
        );
      }
      setResult(filtered.reverse());
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllResult();
  }, [DeThi]);

  const columns = [
    {
      title: "Ngày làm bài",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (
        <span style={{ fontSize: "0.9375rem" }}>
          {new Date(val).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Điểm",
      key: "score",
      render: (record: Result) => (
        <span
          style={{
            fontWeight: 600,
            fontSize: "1.125rem",
            color: record.score >= 5 ? "#52c41a" : "#ff4d4f",
          }}
        >
          {record.score}/10
        </span>
      ),
    },
    {
      title: "Số câu đúng",
      key: "correct",
      render: (record: Result) => (
        <span style={{ fontSize: "0.9375rem" }}>
          {record.correctAnswer}/{record.questions.length}
        </span>
      ),
    },
    {
      title: "Thời gian làm",
      key: "duration",
      render: (record: Result) => {
        const start = new Date(record.createdAt).getTime();
        const end = new Date(record.endTime).getTime();
        const duration = Math.round((end - start) / 60000);
        return <span style={{ fontSize: "0.9375rem" }}>{duration} phút</span>;
      },
    },
    {
      title: "",
      key: "action",
      render: (record: Result) => (
        <Button
          type="primary"
          onClick={() => {
            setDetail(record);
            setIsDetail(true);
          }}
          style={{
            borderRadius: "6px",
            fontWeight: 500,
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "0" }}>
      {isDetail && detail !== undefined ? (
        <div>
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <Button
              onClick={() => setIsDetail(false)}
              style={{
                borderRadius: "6px",
                fontWeight: 500,
                height: "40px",
                padding: "0 24px",
              }}
            >
              ← Quay về danh sách
            </Button>
          </div>
          <ChiTietKetQua result={detail} />
        </div>
      ) : (
        <>
          {result.length > 0 ? (
            <Table
              columns={columns}
              dataSource={result}
              rowKey="_id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                style: { marginTop: "1.5rem" },
              }}
              style={{
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
              }}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
              }}
            >
              <AntText type="secondary" style={{ fontSize: "1rem" }}>
                Chưa có lịch sử làm bài
              </AntText>
            </div>
          )}
        </>
      )}
    </div>
  );
};
