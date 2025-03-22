import { Exam, Question } from "@/services/teacher/Teacher";
import { Button } from "antd";
import Table, { ColumnsType } from "antd/es/table";

import { useEffect, useState } from "react";

import { ExamAPIStudent } from "@/services/student";
import { useNavigate } from "react-router-dom";

const columns: ColumnsType<Exam> = [
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Thời gian phút",
    dataIndex: "duration",
    sorter: (a: Exam, b: Exam) => a.duration - b.duration,
    key: "duration",
  },
  {
    title: "Thời gian bắt đầu",
    dataIndex: "startTime",
    key: "startTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.startTime || 0).getTime() -
      new Date(b.startTime || 0).getTime(),
    render: (text: string) => (text ? new Date(text).toLocaleString() : "N/A"),
  },
  {
    title: "Thời gian kết thúc",
    dataIndex: "endTime",
    key: "endTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.endTime || 0).getTime() - new Date(b.endTime || 0).getTime(),
    render: (text: string) => (text ? new Date(text).toLocaleString() : "N/A"),
  },

  {
    title: "Số câu hỏi",
    dataIndex: "questions",
    key: "questions",
    sorter: (a: Exam, b: Exam) =>
      (a.questions?.length ?? 0) - (b.questions?.length ?? 0),
    render: (record: Question[]) => record.length ?? 0,
  },
];
export const KyThi = () => {
  const [data, setData] = useState<Exam[]>();
  const [total, setTotal] = useState<number>(0);

  const getAllExam = async (page: number) => {
    try {
      const rq = await ExamAPIStudent.getAllExam1000(page);
      if (rq?.code === 200) {
        const now = new Date().getTime();
        const filteredExams = rq.exams.filter((exam: Exam) => {
          const startTime = new Date(exam.startTime).getTime();
          const endTime = exam.endTime
            ? new Date(exam.endTime).getTime()
            : Infinity;
          return startTime <= now && now <= endTime;
        });
        setData((prev) => [...(prev || []), ...filteredExams]);
        setTotal(rq?.total);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    if (total > 1) {
      Promise.all(
        Array.from({ length: total - 1 }, (_, i) => getAllExam(i + 2))
      );
    }
  }, [total]);
  useEffect(() => {
    getAllExam(1);
  }, []);

  const navigator = useNavigate();
  const navagiteToDetail = (id: string) => {
    navigator(`/KyThi/ChiTiet/${id}`);
  };
  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold ">Danh sách kỳ thi</h1>
      </center>

      {data ? (
        <Table
          dataSource={data}
          showSorterTooltip={false}
          columns={[
            ...columns,

            {
              title: "",
              key: "action",
              render: (_, record) => (
                <Button
                  color="primary"
                  variant="solid"
                  onClick={() => {
                    navagiteToDetail(record.slug);
                  }}
                >
                  Chi tiết
                </Button>
              ),
            },
          ]}
        />
      ) : null}
    </div>
  );
};
