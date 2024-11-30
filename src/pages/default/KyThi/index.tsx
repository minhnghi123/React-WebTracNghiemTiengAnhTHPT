import { Exam, ExamAPI } from "@/services/teacher/Teacher";
import { Button, Pagination, Space, Tag } from "antd";
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
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    render: (text: string, record: Exam) =>
      new Date(record.startTime).toLocaleString(),
  },
  {
    title: "Thời gian kết thúc",
    dataIndex: "endTime",
    key: "endTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.endTime || 0).getTime() - new Date(b.endTime || 0).getTime(),
    render: (text: string, record: Exam) =>
      record.endTime ? new Date(record.endTime).toLocaleString() : "N/A",
  },

  {
    title: "Số câu hỏi",
    dataIndex: "questions",
    key: "questions",
    sorter: (a: Exam, b: Exam) => a.questions.length - b.questions.length,
    render: (text: string, record: Exam) => record.questions.length,
  },
];
export const KyThi = () => {
  const handleCreateSuccess = () => {
    getAllExam(page);
  };
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<Exam[]>();

  const getAllExam = async (page: number) => {
    try {
      const rq = await ExamAPIStudent.getAllExam(page);

      if (rq?.code === 200) {
        setData(rq?.exams);
        setTotal(rq?.totalPage);
        setPage(rq?.currentPage);
        console.log(data);
        console.log(total);
        console.log(page);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    getAllExam(page);
  }, [page]);

  const onPageChange = (page: number) => {
    setPage(page);
  };
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
          pagination={false}
        />
      ) : null}
      <div className="flex justify-center mt-4">
        <Pagination
          current={page}
          total={total}
          onChange={onPageChange}
          pageSize={1}
          style={{ display: "flex", justifyContent: "center" }}
        />
      </div>
    </div>
  );
};
