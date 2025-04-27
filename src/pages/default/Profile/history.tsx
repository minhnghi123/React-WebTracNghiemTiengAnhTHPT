import React, { useState, useEffect, useMemo } from "react";
import { Tabs, Select, Table, Card } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import moment from "moment";
import { Result, ResultAPI } from "@/services/student";

const { TabPane } = Tabs;

// -------------------- PHẦN HISTORY TABLE & CHART --------------------

// Các cột của bảng kết quả
const columns: ColumnsType<Result> = [
  {
    title: "Ngày làm bài",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (text: string) => moment(text).format("DD/MM/YYYY HH:mm"),
    sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
  },
  {
    title: "Điểm",
    key: "score",
    sorter: (a, b) => {
      const aScore =
        a.questions && a.questions.length > 0
          ? (a.score / a.questions.length) * 10
          : 0;
      const bScore =
        b.questions && b.questions.length > 0
          ? (b.score / b.questions.length) * 10
          : 0;
      return aScore - bScore;
    },
    render: (_, record) => {
      return record.score;
    },
  },
  {
    title: "Câu đúng",
    dataIndex: "correctAnswer",
    key: "correctAnswer",
    sorter: (a, b) => a.correctAnswer - b.correctAnswer,
  },
  {
    title: "Câu sai",
    dataIndex: "wrongAnswer",
    key: "wrongAnswer",
    sorter: (a, b) => a.wrongAnswer - b.wrongAnswer,
  },
];

// -------------------- PHẦN HEATMAP --------------------

// Các hằng số cho heatmap
const cellSize = 14; // Kích thước mỗi ô vuông
const cellGap = 3; // Khoảng cách giữa các ô
const topMargin = 20; // Khoảng trống phía trên để hiển thị label tháng
const leftMargin = 30; // Khoảng trống bên trái để hiển thị label ngày trong tuần
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
// Bắt đầu từ Thứ Hai
const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayData {
  date: Date;
  hasTest: boolean;
}

function generateDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

interface HistoryHeatmapProps {
  testHistory: Result[];
}
const HistoryHeatmap: React.FC<HistoryHeatmapProps> = ({ testHistory }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  // Lấy mảng các ngày có làm bài từ testHistory có trong năm được chọn
  const testDates = useMemo(() => {
    return testHistory
      .map((item) => new Date(item.createdAt))
      .filter((d) => d.getFullYear() === year);
  }, [testHistory, year]);

  const daysInYear = generateDaysInYear(year);

  const testSet = new Set(testDates.map((d) => d.toISOString().slice(0, 10)));

  const dayDataList: DayData[] = daysInYear.map((day) => {
    const iso = day.toISOString().slice(0, 10);
    return {
      date: new Date(day),
      hasTest: testSet.has(iso),
    };
  });

  const firstDayOfYear = new Date(year, 0, 1);
  const lastDayOfYear = new Date(year, 11, 31);
  const totalWeeks =
    Math.ceil(
      (lastDayOfYear.getTime() - firstDayOfYear.getTime()) /
        (1000 * 60 * 60 * 24 * 7)
    ) + 1;

  const svgWidth = leftMargin + totalWeeks * (cellSize + cellGap);
  const svgHeight = topMargin + 7 * (cellSize + cellGap);

  const getWeekIndex = (day: Date) => {
    const diff = day.getTime() - firstDayOfYear.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  };

  // Chuyển đổi thứ của ngày: JS 0=Sun, 1=Mon,... => 0=Mon, ...6=Sun
  const getDayOfWeek = (day: Date) => {
    const jsDay = day.getDay();
    return (jsDay + 6) % 7;
  };

  const monthLabels: { x: number; label: string }[] = [];
  dayDataList.forEach(({ date }) => {
    if (date.getDate() === 1) {
      const xPos = leftMargin + getWeekIndex(date) * (cellSize + cellGap);
      monthLabels.push({
        x: xPos,
        label: MONTH_NAMES[date.getMonth()],
      });
    }
  });

  return (
    <div style={{ margin: "20px" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Activity Calendar
      </h3>
      <center>
      <div style={{ textAlign: "center", marginBottom: "10px", justifyContent: "center" }}>
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
    
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ border: "1px solid #ccc" }}
      >
        {/* Label tháng */}
        {monthLabels.map((m, i) => (
          <text key={i} x={m.x} y={12} fontSize={10} fill="#666">
            {m.label}
          </text>
        ))}

        {/* Label ngày trong tuần (hiển thị Mon, Wed, Fri) */}
        {WEEKDAY_NAMES.map((wday, idx) => {
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
              fill={hasTest ? "#1ebc73" : "#ebedf0"}
              rx={2}
              ry={2}
            >
              <title>{formatDate(date)}</title>
            </rect>
          );
        })}
      </svg>
      </center>
    </div>
  );
};

// -------------------- HISTORY PAGE --------------------

export const HistoryPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<string>("7");
  // timeFilter: "3", "7", "30", "90" (3 tháng ~ 90 ngày), "365" (1 năm)
  const [testHistory, setTestHistory] = useState<Result[]>([]);

  // Gọi API lấy lịch sử làm bài
  const fetchTestHistory = async () => {
    setLoading(true);
    try {
      const fetchAllResult = await ResultAPI.getAllResult(1);
      if (fetchAllResult.code === 200) {
        // Reverse để mới nhất lên đầu (tuỳ ý)
        const response = fetchAllResult.data.reverse();
        setTestHistory(response);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestHistory();
  }, []);

  // Lọc dữ liệu cho bảng theo timeFilter (số ngày tính từ hiện tại)
  const filteredData = useMemo(() => {
    if (!testHistory) return [];
    const now = moment();
    const cutoff = now.clone().subtract(parseInt(timeFilter), "days");
    return testHistory.filter((item) =>
      moment(item.createdAt).isSameOrAfter(cutoff)
    );
  }, [testHistory, timeFilter]);

  // Chuẩn bị dữ liệu cho biểu đồ toàn thời gian (không lọc)
  const chartData = useMemo(() => {
    const sorted = [...testHistory].sort(
      (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix()
    );
    return sorted.map((item) => {
      return {
        date: moment(item.createdAt).format("DD/MM"),
        score: item.score,
      };
    });
  }, [testHistory]);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Lịch sử làm bài</h2>
      <Tabs defaultActiveKey="1">
        {/* Tab 1: Biểu đồ điểm toàn thời gian */}
        <TabPane tab="Biểu đồ điểm" key="1">
          <Card style={{ marginBottom: 16 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Không có dữ liệu.</p>
            )}
          </Card>
        </TabPane>

        {/* Tab 2: Danh sách kết quả lọc theo số bài làm trong khoảng thời gian */}
        <TabPane tab="Danh sách kết quả" key="2">
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8 }}>Lọc theo:</span>
            <Select
              value={timeFilter}
              style={{ width: 120 }}
              onChange={(val) => setTimeFilter(val)}
            >
              <Select.Option value="3">3 ngày</Select.Option>
              <Select.Option value="7">7 ngày</Select.Option>
              <Select.Option value="30">30 ngày</Select.Option>
              <Select.Option value="90">3 tháng</Select.Option>
              <Select.Option value="365">1 năm</Select.Option>
            </Select>
          </div>
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="_id"
            loading={loading}
          />
        </TabPane>
      </Tabs>
      <HistoryHeatmap testHistory={testHistory} />
    </div>
  );
};

export default HistoryPage;
