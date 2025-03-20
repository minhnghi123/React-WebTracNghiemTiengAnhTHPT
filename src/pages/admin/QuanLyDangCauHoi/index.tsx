import { QuestionType, QuestionTypeAPI } from "@/services/teacher/Teacher";
import { Button, Modal, Pagination, Space, Table } from "antd";
import { useEffect, useState } from "react";
import { CreateQuestionTypeModal } from "./DangCauHoi/CreateDangCauHoiModal";
import { UpdateQuestionTypeModal } from "./DangCauHoi/UpdateDangCauHoiModal";

export const QuanLyDangCauHoi = () => {
  const handleCreateSuccess = () => {
    getAllQT(page);
  };
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<QuestionType[]>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModal2, setShowModal2] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const getAllQT = async (page: number) => {
    try {
      const rq = await QuestionTypeAPI.getAllQuestionType(page);

      if (rq?.code === 200) {
        setData(rq?.questionTypes);
        setTotal(rq?.totalPage);
        setPage(rq?.currentPage);
  
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };

  useEffect(() => {
    getAllQT(page);
  }, [page]);

  const onPageChange = (page: number) => {
    setPage(page);
  };

  const handleOk = () => {
    handleDeleteQuestion(id);
    setOpen(false);
  };
  const handleDeleteQuestion = async (id: string) => {
    try {
      const rq = await QuestionTypeAPI.deleteQuestionType(id);
      if (rq?.code === 200) {
        alert("Xóa dạng câu hỏi thành công");
        getAllQT(page);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  const handleCancel = () => {
    setOpen(false);
  };
  return (
    <div className="container mx-auto p-4">
      <center>
        <h1 className="text-3xl font-bold ">Quản lý Dạng câu hỏi</h1>
      </center>
      <div>
        <button
          className="btn btn-primary  my-3"
          onClick={() => setShowModal(true)}
        >
          Thêm dạng câu hỏi mới
        </button>
      </div>
      {data ? (
        <Table
          dataSource={data}
          showSorterTooltip={false}
          columns={[
            {
              title: "Tên dạng câu hỏi",
              dataIndex: "name",
              key: "name",
              width: "20%",
            },
            {
              title: "Mô tả",
              dataIndex: "description",
              key: "description",
              width: "70%",
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
                    onClick={() => {
                      setId(record._id || ""), setShowModal2(true);
                    }}
                  >
                    Sửa
                  </Button>

                  <Button
                    color="danger"
                    variant="solid"
                    onClick={() => {
                      setId(record._id || ""), setOpen(true);
                    }}
                  >
                    Xóa
                  </Button>
                </Space>
              ),
              width: "10%",
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
      <CreateQuestionTypeModal
        visible={showModal}
        handleClose={() => {
          setShowModal(false), handleCreateSuccess();
        }}
      />
      <UpdateQuestionTypeModal
        id={id}
        visible={showModal2}
        handleClose={() => {
          setShowModal2(false), handleCreateSuccess();
        }}
      />
      <Modal
        open={open}
        title="Xóa Dạng câu hỏi"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      ></Modal>
    </div>
  );
};
