import AutoGenerateExamForm from "./AutoGenerateExam";
const sampleAllDangBais = [
  {
    id: 1,
    name: "Dang Bai 1",
    description: "Description for Dang Bai 1",
    MaLoai: "Loai 1",
    TenLoai: "Loai 1",
  },
  {
    id: 2,
    name: "Dang Bai 2",
    description: "Description for Dang Bai 2",
    MaLoai: "Loai 2",
    TenLoai: "Loai 2",
  },
  {
    id: 3,
    name: "Dang Bai 3",
    description: "Description for Dang Bai 3",
    MaLoai: "Loai 3",
    TenLoai: "Loai 3",
  },
];
export const OnTap = () => {
  return (
    <div className="">
      
      <AutoGenerateExamForm
        totalQuestions={10}
        easyQuestions={4}
        hardQuestions={7}
        allDangBais={sampleAllDangBais}
      />
    </div>
  );
};
