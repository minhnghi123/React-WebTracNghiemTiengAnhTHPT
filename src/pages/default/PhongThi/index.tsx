import { Space, Table } from "antd";
import type { TableProps } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
interface ClassRoom {
  key: string;
  name: string;
  TeacherName: string;
}

const columns: TableProps<ClassRoom>["columns"] = [
  {
    title: "Tên phòng",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Giáo viên",
    dataIndex: "TeacherName",
    key: "age",
  },
  {
    title: "Action",
    key: "action",
    render: (_) => (
      <Space size="middle">
        <a>Tham gia lớp</a>
      </Space>
    ),
  },
];

const data: ClassRoom[] = [
  {
    key: "1",
    name: "Lớp 11a3",
    TeacherName: "Cô An", // Giáo viên ID
  },
  {
    key: "2",
    name: "Lớp 12a1",
    TeacherName: "Cô An", // Giáo viên ID
  },
  {
    key: "3",
    name: "Lớp 101",
    TeacherName: "Cô An", // Giáo viên ID
  },
  {
    key: "4",
    name: "S 202",
    TeacherName: "Cô An", // Giáo viên ID
  },
  {
    key: "5",
    name: "TA 301",
    TeacherName: "Cô An", // Giáo viên ID
  },
];

export const PhongThi = () => {
  return (
    <div className="">
      <center className="fw-bold my-3"> Danh sách lớp </center>
      <div className="row justify-content-center">
        <div className="col-9 ">
          <Table<ClassRoom> columns={columns} dataSource={data} />
        </div>
      </div>
    </div>
  );
};
