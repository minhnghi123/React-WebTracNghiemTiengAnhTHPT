import { Exam, ExamAPI } from "@/services/teacher/Teacher";
import { Button, Pagination, Space, Tag } from "antd";
import Table, { ColumnsType } from "antd/es/table";

import { useEffect, useState } from "react";
import CreateExamModal from "./DeThi/CreateExam";
import { useNavigate } from "react-router-dom";
import CreateExamModalAuTo from "./DeThi/CreateExamQuestion.tsx/CreateExamAuto";
import CreateExamModalShedule from "./DeThi/CreateExamQuestion.tsx/SetExamModalShedule";

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
    render: (record: Exam) => new Date(record.startTime).toLocaleString(),
  },
  {
    title: "Thời gian kết thúc",
    dataIndex: "endTime",
    key: "endTime",
    sorter: (a: Exam, b: Exam) =>
      new Date(a.endTime || 0).getTime() - new Date(b.endTime || 0).getTime(),
    render: (record: Exam) =>
      record.endTime ? new Date(record.endTime).toLocaleString() : "N/A",
  },

  {
    title: "Số câu hỏi",
    dataIndex: "questions",
    key: "questions",
    sorter: (a: Exam, b: Exam) => a.questions.length - b.questions.length,
    render: (record: Exam) => record.questions.length,
  },
];
export const QuanLyDeThi = () => {
  const handleCreateSuccess = () => {
    getAllExam(page);
  };
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<Exam[]>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const changeSatusExam = async (id: string) => {
    try {
      const rq = await ExamAPI.changePublic(id);

      if (rq?.success) {
        getAllExam(page);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const getAllExam = async (page: number) => {
    try {
      const rq = await ExamAPI.getAllExam(page);
      console.log(rq.data);
      if (rq?.success) {
        setData(rq?.data);
        setTotal(rq?.pagination.totalPages);
        setPage(rq?.pagination.page);
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
  const hadleDelete = async (id: string) => {
    confirm("Bạn có chắc chắn muốn xóa đề thi này không?");
    if (!confirm) return;
    try {
      const rq = await ExamAPI.deleteExam(id);
      console.log(rq);
      if (rq?.success) {
        getAllExam(page);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const [showModalSchedule, setShowModalSchedule] = useState<string | null>(
    null
  );
  const [showModalCreatAuto, setShowModalCreatAuto] = useState<boolean>(false);
  const navigatetor = useNavigate();
  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold ">Quản lý đề thi</h1>
      </center>
      <div>
        <button
          className="btn btn-primary   my-3 mx-3"
          onClick={() => navigatetor("/giaovien/QuanLyDeThi/CreateExam")}
        >
          Tạo đề thi
        </button>
        <button
          className="btn btn-primary  my-3 mx-3"
          onClick={() => setShowModalCreatAuto(true)}
        >
          Tạo đề thi tự động
        </button>
      </div>
      {data ? (
        <Table
          dataSource={data}
          showSorterTooltip={false}
          columns={[
            ...columns,
            {
              title: "Công khai",
              dataIndex: "isPublic",
              key: "isPublic",
              filters: [
                { text: "Công khai", value: true },
                { text: "Riêng", value: false },
              ],
              onFilter: (value, record) => record.isPublic === value,
              render: (record: Exam) => (
                <center>
                  {record.isPublic ? (
                    <Tag
                      color="green"
                      onClick={() => changeSatusExam(record._id || "")}
                      style={{ cursor: "pointer" }}
                    >
                      Công khai
                    </Tag>
                  ) : (
                    <Tag
                      color="volcano"
                      onClick={() => changeSatusExam(record._id || "")}
                      style={{ cursor: "pointer" }}
                    >
                      Riêng
                    </Tag>
                  )}
                </center>
              ),
            },

            {
              title: "",
              key: "action",
              render: (_, record) => (
                <Space size="small">
                  <Button
                    color="default"
                    variant="outlined"
                    style={{ backgroundColor: "orange" }}
                    onClick={() => setShowModalSchedule(record._id || "")}
                  >
                    Sửa lịch
                  </Button>
                  <Button
                    color="primary"
                    variant="solid"
                    onClick={() =>
                      navigatetor(
                        "/giaovien/QuanLyDeThi/UpdateExam/" + record.slug
                      )
                    }
                  >
                    Chi tiết
                  </Button>
                  <Button
                    color="danger"
                    variant="solid"
                    onClick={() => hadleDelete(record._id || "")}
                  >
                    Xóa
                  </Button>
                </Space>
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

      <CreateExamModal
        visible={showModal}
        handleClose={() => setShowModal(false)}
        onCreateSuccess={handleCreateSuccess}
        dataQuestion={[]}
      />
      <CreateExamModalAuTo
        visible={showModalCreatAuto}
        handleClose={() => {
          setShowModalCreatAuto(false), getAllExam(page);
        }}
      />
      <CreateExamModalShedule
        visible={
          showModalSchedule === null || showModalSchedule === undefined
            ? false
            : true
        }
        handleClose={() => {
          setShowModalSchedule(null), getAllExam(page);
        }}
        _id={showModalSchedule || ""}
      />
    </div>
  );
};
