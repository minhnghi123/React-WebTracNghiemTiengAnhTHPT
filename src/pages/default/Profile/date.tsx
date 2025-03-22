import { useState } from "react";

interface DayData {
  date: Date;
  hasTest: boolean;
}

const cellSize = 14; // Kích thước mỗi ô vuông
const cellGap = 3; // Khoảng cách giữa các ô
const topMargin = 20; // Khoảng trống phía trên để hiển thị label tháng
const leftMargin = 30; // Khoảng trống bên trái để hiển thị label ngày trong tuần

// Danh sách tên viết tắt tháng
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// Tên viết tắt ngày trong tuần, bắt đầu từ Thứ Hai
const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Hàm tạo mảng Date từ ngày đầu năm tới ngày cuối năm
function generateDaysInYear(year: number) {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// Hàm format ngày thành dd/mm/yyyy
function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Component chính
export default function YearHeatmap() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  // Giả sử testDates là mảng chứa các ngày có bài kiểm tra (định dạng chuỗi hoặc Date)
  // Ở đây mình để ví dụ cứng 1 vài ngày để bạn thấy màu xanh
  const [testDates] = useState<(string | Date)[]>([
    "2025-07-15",
    "2025-07-16",
    "2025-07-19",
    "2025-07-20",
    "2025-08-01",
    "2025-08-05",
    "2025-08-10",
  ]);

  const daysInYear = generateDaysInYear(year);

  // Tạo Set chứa các ngày có bài kiểm tra dưới dạng "YYYY-MM-DD"
  const testSet = new Set(
    testDates.map((d) =>
      d instanceof Date
        ? d.toISOString().slice(0, 10)
        : new Date(d).toISOString().slice(0, 10)
    )
  );

  // Tạo mảng DayData (date + hasTest)
  const dayDataList: DayData[] = daysInYear.map((day) => {
    const iso = day.toISOString().slice(0, 10);
    return {
      date: new Date(day),
      hasTest: testSet.has(iso),
    };
  });

  // Tính số tuần trong năm (cần để tính chiều rộng SVG)
  // Ý tưởng: Lấy ngày đầu năm, tính chênh lệch so với ngày cuối cùng / 7
  const firstDayOfYear = new Date(year, 0, 1);
  const lastDayOfYear = new Date(year, 11, 31);
  const totalWeeks =
    Math.ceil(
      (lastDayOfYear.getTime() - firstDayOfYear.getTime()) /
        (1000 * 60 * 60 * 24 * 7)
    ) + 1;

  // Tính kích thước SVG
  const svgWidth = leftMargin + totalWeeks * (cellSize + cellGap);
  const svgHeight = topMargin + 7 * (cellSize + cellGap);

  // Hàm lấy chỉ số tuần tính từ đầu năm
  const getWeekIndex = (day: Date) => {
    // Lấy chênh lệch ngày so với 1/1
    const diff = day.getTime() - firstDayOfYear.getTime();
    // Số tuần = diff / (ms trong 1 ngày * 7)
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  };

  // Lấy thứ trong tuần (0 = Chủ Nhật => ta muốn 0 = Thứ Hai => map lại)
  // Mặc định JS: 0=Sun, 1=Mon, ... 6=Sat
  // Ở đây ta muốn 0=Mon, 1=Tue, ... => dayOfWeek = (jsDay + 6) % 7
  const getDayOfWeek = (day: Date) => {
    const jsDay = day.getDay(); // 0=Sun
    return (jsDay + 6) % 7; // 0=Mon, 1=Tue, ... 6=Sun
  };

  // Render label tháng:
  // Thường hiển thị tên tháng ở đầu tuần đầu tiên mà tháng đó xuất hiện.
  // Tìm day có date.getDate() <= 7 và date.getDay() == 0?
  // Hoặc approach: Mỗi khi day.getDate() === 1 => in label
  const monthLabels: { x: number; label: string }[] = [];
  dayDataList.forEach(({ date }) => {
    if (date.getDate() === 1) {
      // Tính vị trí x = leftMargin + weekIndex * (cellSize + cellGap)
      const xPos = leftMargin + getWeekIndex(date) * (cellSize + cellGap);
      monthLabels.push({
        x: xPos,
        label: MONTH_NAMES[date.getMonth()],
      });
    }
  });

  return (
    <div style={{ margin: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}></h2>
      {/* Chọn năm */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div style={ { alignItems: "center", display: "flex", justifyContent: "center", width: "100%" } }>
        <svg width={svgWidth} height={svgHeight}>
          {/* Label tháng */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={m.x}
              y={12} // Một chút padding
              fontSize={10}
              fill="#666"
            >
              {m.label}
            </text>
          ))}

          {/* Label ngày trong tuần (Mon, Wed, Fri) - tuỳ biến */}
          {WEEKDAY_NAMES.map((wday, idx) => {
            // Ví dụ: chỉ hiển thị Mon, Wed, Fri
            // idx=0 => Mon, idx=2 => Wed, idx=4 => Fri
            // Tất nhiên, tuỳ bạn chọn hiển thị những ngày nào
            if (idx === 0 || idx === 2 || idx === 4) {
              return (
                <text
                  key={wday}
                  x={0}
                  y={topMargin + idx * (cellSize + cellGap) + cellSize}
                  fontSize={10}
                  fill="#666"
                >
                  {wday}
                </text>
              );
            }
            return null;
          })}

          {/* Vẽ các ô ngày */}
          {dayDataList.map(({ date, hasTest }, idx) => {
            const weekIndex = getWeekIndex(date);
            const dayOfWeek = getDayOfWeek(date);
            const x = leftMargin + weekIndex * (cellSize + cellGap);
            const y = topMargin + dayOfWeek * (cellSize + cellGap);

            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={hasTest ? "#1ebc73" : "#ebedf0"} // xanh hoặc xám
                rx={2} // bo góc 1 chút
                ry={2}
              >
                {/* Tooltip khi hover */}
                <title>{formatDate(date)}</title>
              </rect>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
