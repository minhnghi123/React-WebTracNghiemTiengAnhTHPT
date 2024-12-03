import { Audio, AudioAPI } from "@/services/teacher/Teacher";
import { Button, Modal, Space, Table } from "antd";
import { useEffect, useState } from "react";
import { CreateAudioModal } from "./FileAudio/CreateDangCauHoiModal";
import { UpdateAudioModal } from "./FileAudio/UpdateDangCauHoiModal";

export const QuanLyAudio = () => {
  const handleCreateSuccess = () => {
    getAllQT();
  };

  const [data, setData] = useState<Audio[]>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModal2, setShowModal2] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const getAllQT = async () => {
    try {
      const rq = await AudioAPI.getAllAudio();

      setData(rq);
    } catch (error: any) {
      if (error.response) {
        console.log(error.response.data.message);
      }
    }
  };
  useEffect(() => {
    getAllQT();
  }, []);
  const handleOk = () => {
    handleDeleteQuestion(id);
    setOpen(false);
  };
  const handleDeleteQuestion = async (id: string) => {
    try {
      const rq = await AudioAPI.deleteAudio(id);
      if (rq?.success) {
        alert("Xóa file nghe thành công");
        getAllQT();
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
        <h1 className="text-3xl font-bold ">Quản lý file nghe</h1>
      </center>
      <div>
        <button
          className="btn btn-primary  my-3"
          onClick={() => setShowModal(true)}
        >
          Thêm file nghe mới
        </button>
      </div>
      {data ? (
        <Table
          dataSource={data}
          showSorterTooltip={false}
          columns={[
            {
              title: "Tên file nghe",
              dataIndex: "description",
              key: "description",
              width: "20%",
            },
            {
              title: "Transcription",
              dataIndex: "transcription",
              key: "transcription",
              width: "50%",
            },
            {
              title: "filePath",

              key: "filePath",
              width: "20%",
              render: (record: Audio) => (
                <audio controls src={record.filePath} />
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
          pagination={{ pageSize: 5 }}
        />
      ) : null}

      <CreateAudioModal
        visible={showModal}
        handleClose={() => {
          setShowModal(false), getAllQT();
        }}
      />
      <UpdateAudioModal
        audioData={data?.find((item) => item._id === id) || ({} as Audio)}
        visible={showModal2}
        handleClose={() => {
          setShowModal2(false), handleCreateSuccess();
        }}
      />
      <Modal
        open={open}
        title="Xóa file nghe"
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
