import React, { useState, useEffect } from "react";
import "./index.css";
interface DangBai {
  MaLoai: string;
  TenLoai: string;
}

interface Props {
  totalQuestions: number;
  easyQuestions: number;
  hardQuestions: number;
  allDangBais: DangBai[];
}

const AutoGenerateExamForm: React.FC<Props> = ({
  totalQuestions,
  easyQuestions,
  hardQuestions,
  allDangBais,
}) => {
  const [easyCount, setEasyCount] = useState<number>(0);
  const [hardCount, setHardCount] = useState<number>(0);
  const [examTime, setExamTime] = useState<number>(10);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const maxTypes = 3;

  const handleAddType = (event: React.MouseEvent<HTMLButtonElement>) => {
    const select = document.getElementById("dangBaiList") as HTMLSelectElement;
    const value = select.value;
    const text = select.options[select.selectedIndex].text;

    if (selectedTypes.length < maxTypes && !selectedTypes.includes(value)) {
      setSelectedTypes([...selectedTypes, value]);
    } else {
      alert("Chỉ có thể thêm tối đa 3 dạng bài.");
    }
  };

  const handleRemoveType = (value: string) => {
    setSelectedTypes(selectedTypes.filter((item) => item !== value));
  };

  return (
    <form method="post" action="/OnTap/AutoGenerateExam" className="my-3">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ flex: 1, marginRight: "10px" }}>
          <h3>Câu hỏi trong CSDL</h3>
          <div>
            <label>
              Tổng số lượng câu hỏi <span>{totalQuestions}</span>
            </label>
          </div>
          <div>
            <label>
              Số lượng câu hỏi dễ: <span>{easyQuestions}</span>
            </label>
          </div>
          <div>
            <label>
              Số lượng câu hỏi khó: <span>{hardQuestions}</span>
            </label>
          </div>
        </div>

        <div style={{ flex: 1, marginLeft: "10px" }}>
          <h3>Lựa chọn số câu hỏi</h3>
          <div>
            <label>Số lượng câu hỏi dễ trong đề thi:</label>
            <input
              type="number"
              name="SoCauHoiDe"
              min="0"
              max={easyQuestions}
              value={easyCount}
              onChange={(e) => setEasyCount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Số lượng câu hỏi khó trong đề thi:</label>
            <input
              type="number"
              name="SoCauHoiKho"
              min="0"
              max={hardQuestions}
              value={hardCount}
              onChange={(e) => setHardCount(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label>Thời gian đề thi (phút):</label>
            <select
              name="ThoiGian"
              value={examTime}
              onChange={(e) => setExamTime(Number(e.target.value))}
              required
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i} value={(i + 1) * 10}>
                  {(i + 1) * 10} phút
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4>Dạng câu hỏi</h4>
        <ul id="ss" className="dangbai-list">
          {selectedTypes.map((type) => (
            <li key={type}>
              {allDangBais.find((dangBai) => dangBai.MaLoai === type)?.TenLoai}
              <button type="button" onClick={() => handleRemoveType(type)}>
                ×
              </button>
            </li>
          ))}
        </ul>

        <h4>Thêm dạng câu hỏi</h4>
        {allDangBais && allDangBais.length > 0 && (
          <>
            <select id="dangBaiList" className="form-control">
              {allDangBais.map((dangBai) => (
                <option key={dangBai.MaLoai} value={dangBai.MaLoai}>
                  {dangBai.TenLoai}
                </option>
              ))}
            </select>
            <button
              type="button"
              id="addDangBaiButton"
              className="btn btn-primary mt-2"
              onClick={handleAddType}
            >
              Add
            </button>
          </>
        )}
      </div>

      <input
        type="hidden"
        id="ssInput"
        name="Seleted"
        value={selectedTypes.join(",")}
      />

      <div className="text-center my-4">
        <input
          type="submit"
          className="btn btn-success btn-lg px-5"
          value="Tạo Đề Thi"
        />
      </div>
    </form>
  );
};

export default AutoGenerateExamForm;
