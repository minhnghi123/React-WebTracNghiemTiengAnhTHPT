import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlashCardSet } from "@/services/student/FlashCardAPI";
import { Button, Modal, Card } from "antd";
import {
  CheckCircleOutlined,
  ReloadOutlined,
  BookOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";

const nodeRadius = 8;

interface Node {
  x: number;
  y: number;
}

interface FlashCardMatchProps {
  flashCardSet: FlashCardSet;
}

const findClosestNode = (
  nodes: Node[],
  mouse: Node,
  threshold = nodeRadius
): Node | undefined =>
  nodes.find(
    (node) =>
      Math.abs(mouse.x - node.x) < threshold &&
      Math.abs(mouse.y - node.y) < threshold
  );

const filterInPlace = <T,>(arr: T[], rem: T[]) =>
  arr
    .reduce((r, e, i) => (rem.includes(e) ? r.concat(i) : r), [] as number[])
    .sort((a, b) => b - a)
    .forEach((i) => arr.splice(i, 1));

const sameVertical = (p1: Node, p2: Node) => p1 && p2 && p1.x === p2.x;
const equalsNode = (n1: Node, n2: Node) =>
  n1 && n2 && n1.x === n2.x && n1.y === n2.y;
const equalsEdge = (e1: [Node, Node], e2: [Node, Node]) =>
  equalsNode(e1[0], e2[0]) && equalsNode(e1[1], e2[1]);
const hasEdge = (edges: [Node, Node][], edge: [Node, Node]) =>
  edges.some((otherEdge) => equalsEdge(edge, otherEdge));
const addEdge = (edges: [Node, Node][], edge: [Node, Node]) => {
  if (!hasEdge(edges, edge)) {
    filterInPlace(
      edges,
      edges.filter((o) => equalsNode(edge[0], o[0]))
    );
    edges.push(edge);
    return true;
  }
  return false;
};

const isCorrectEdge = (
  edge: [Node, Node],
  nodes: Node[],
  leftArr: string[],
  rightArr: string[],
  flashCardSet: FlashCardSet
): boolean => {
  // Tách nodes thành 2 mảng: bên trái và bên phải
  const leftNodes = nodes.slice(0, leftArr.length);
  const rightNodes = nodes.slice(leftArr.length);
  const leftIdx = leftNodes.findIndex(
    (n) => Math.abs(n.x - edge[0].x) < 1 && Math.abs(n.y - edge[0].y) < 1
  );
  const rightIdx = rightNodes.findIndex(
    (n) => Math.abs(n.x - edge[1].x) < 1 && Math.abs(n.y - edge[1].y) < 1
  );
  if (leftIdx === -1 || rightIdx === -1) return false;
  const term = leftArr[leftIdx];
  const definition = rightArr[rightIdx];
  const original = flashCardSet.vocabs.find(
    (v: any) => typeof v !== "string" && v.term === term
  );
  return original && typeof original !== "string"
    ? original.definition === definition
    : false;
};

export const FlashCardMatch: React.FC<FlashCardMatchProps> = ({
  flashCardSet,
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [edges, setEdges] = useState<[Node, Node][]>([]);
  const [showResultModal, setShowResultModal] = useState(false); // ✅ Thêm state
  const [detailedResults, setDetailedResults] = useState<
    Array<{ term: string; definition: string; isCorrect: boolean }>
  >([]);

  const leftArr = useMemo(
    () =>
      flashCardSet.vocabs
        .map((vocab) =>
          typeof vocab === "object" && "term" in vocab ? vocab.term : ""
        )
        .sort(() => Math.random() - 0.5),
    [flashCardSet]
  );

  const rightArr = useMemo(
    () =>
      flashCardSet.vocabs
        .map((vocab) =>
          typeof vocab === "object" && "term" in vocab ? vocab.definition : ""
        )
        .sort(() => Math.random() - 0.5),
    [flashCardSet]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const { height, width } = ctx.canvas;
    const rowHeight = height / leftArr.length;
    const margin = nodeRadius * 2.5;

    const nodes: Node[] = [
      ...leftArr.map((_, i) => ({
        x: margin,
        y: i * rowHeight + rowHeight / 2,
      })),
      ...rightArr.map((_, i) => ({
        x: width - margin,
        y: i * rowHeight + rowHeight / 2,
      })),
    ];

    let activeNode: Node | null = null;
    let mouse: Node | null = null;
    let isDragging = false;

    const onMouseDown = () => {
      if (!mouse) return;
      const closestNode = findClosestNode(nodes, mouse);
      activeNode = closestNode || null;
      isDragging = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseUp = () => {
      isDragging = false;
      if (!mouse || !activeNode) return;
      const intentRadius = nodeRadius * 1.5;
      const closestNode = findClosestNode(nodes, mouse, intentRadius);
      if (
        activeNode &&
        closestNode &&
        !equalsNode(activeNode, closestNode) &&
        !sameVertical(activeNode, closestNode)
      ) {
        const edge: [Node, Node] = [activeNode, closestNode].sort(
          (a, b) => a.x - b.x
        ) as [Node, Node];
        setEdges((prevEdges) => {
          const newEdges = [...prevEdges];
          addEdge(newEdges, edge);
          return newEdges;
        });
        activeNode = null;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      let currentCorrectCount = 0;

      edges.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.lineWidth = 2;
        if (isSubmitted) {
          const isCorrect = isCorrectEdge(
            [start, end],
            nodes,
            leftArr,
            rightArr,
            flashCardSet
          );
          ctx.strokeStyle = isCorrect ? "green" : "red";
          if (isCorrect) currentCorrectCount++;
        } else {
          ctx.strokeStyle = "black";
        }
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      });

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle =
          activeNode && equalsNode(node, activeNode) ? "black" : "darkgrey";
        ctx.fill();
      });

      if (isDragging && activeNode && mouse) {
        const intentRadius = nodeRadius * 1.5;
        const closestNode = findClosestNode(nodes, mouse, intentRadius);
        const intent = closestNode || mouse;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.setLineDash([3, 3]);
        ctx.moveTo(activeNode.x, activeNode.y);
        ctx.lineTo(intent.x, intent.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (isSubmitted) {
        setCorrectCount(currentCorrectCount);
      }

      requestAnimationFrame(animate);
    };

    animate();

    canvasRef.current.addEventListener("mousedown", onMouseDown);
    canvasRef.current.addEventListener("mousemove", onMouseMove);
    canvasRef.current.addEventListener("mouseup", onMouseUp);

    return () => {
      if (!canvasRef.current) return;
      canvasRef.current.removeEventListener("mousedown", onMouseDown);
      canvasRef.current.removeEventListener("mousemove", onMouseMove);
      canvasRef.current.removeEventListener("mouseup", onMouseUp);
    };
  }, [canvasRef, leftArr, rightArr, isSubmitted, edges, flashCardSet]);

  const handleSubmit = () => {
    setIsSubmitted(true);

    // ✅ Tính toán kết quả chi tiết
    const results: Array<{
      term: string;
      definition: string;
      isCorrect: boolean;
    }> = [];
    const leftNodes = nodes.slice(0, leftArr.length);
    const rightNodes = nodes.slice(leftArr.length);

    edges.forEach((edge) => {
      const leftIdx = leftNodes.findIndex(
        (n) => Math.abs(n.x - edge[0].x) < 1 && Math.abs(n.y - edge[0].y) < 1
      );
      const rightIdx = rightNodes.findIndex(
        (n) => Math.abs(n.x - edge[1].x) < 1 && Math.abs(n.y - edge[1].y) < 1
      );

      if (leftIdx !== -1 && rightIdx !== -1) {
        const term = leftArr[leftIdx];
        const definition = rightArr[rightIdx];
        const isCorrect = isCorrectEdge(
          edge,
          nodes,
          leftArr,
          rightArr,
          flashCardSet
        );
        results.push({ term, definition, isCorrect });
      }
    });

    setDetailedResults(results);
    setShowResultModal(true);
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCorrectCount(0);
    setEdges([]);
  };

  return (
    <div className="flashcard-exam-page">
      {/* Hero Section */}
      <div className="exam-hero-compact">
        <div className="hero-background"></div>
        <div className="hero-content">
          <BookOutlined className="hero-icon" />
          <h1 className="hero-title">Match Game</h1>
          <p className="hero-subtitle">{flashCardSet.title}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flashcard-exam-container">
        <div className="match-game-container">
          <p
            style={{
              textAlign: "center",
              marginBottom: "1.5rem",
              color: "#6b7280",
              fontSize: "0.9375rem",
            }}
          >
            Kéo từ các điểm bên trái sang các điểm bên phải để nối từ với định
            nghĩa tương ứng
          </p>

          <div className="match-game-app">
            <div className="match-column">
              {leftArr.map((e, i) => (
                <div key={i} className="match-item">
                  {e}
                </div>
              ))}
            </div>
            <canvas
              ref={canvasRef}
              className="match-canvas"
              width={400}
              height={600}
            />
            <div className="match-column">
              {rightArr.map((e, i) => (
                <div key={i} className="match-item">
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="exam-submit-section">
          {!isSubmitted ? (
            <div className="match-controls">
              <Button
                type="primary"
                onClick={handleSubmit}
                className="submit-button"
                icon={<CheckCircleOutlined />}
              >
                Nộp bài
              </Button>
              <Button
                onClick={handleReset}
                className="back-button"
                icon={<ReloadOutlined />}
              >
                Làm lại
              </Button>
            </div>
          ) : (
            <div className="score-display-card">
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: "1rem",
                }}
              >
                Kết quả làm bài
              </h2>
              <div className="score-stats">
                <div className="score-stat-item">
                  <div className="score-value correct">{correctCount}</div>
                  <div className="score-label">Câu đúng</div>
                </div>
                <div className="score-stat-item">
                  <div className="score-value wrong">
                    {leftArr.length - correctCount}
                  </div>
                  <div className="score-label">Câu sai</div>
                </div>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <Button
                  onClick={handleReset}
                  className="back-button"
                  icon={<ReloadOutlined />}
                  style={{ marginLeft: 0 }}
                >
                  Làm lại
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate(`/flashcard/${flashCardSet._id}`)}
            className="back-button"
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: "1rem" }}
          >
            Quay lại chi tiết
          </Button>
        </div>
      </div>

      {/* ✅ Result Modal */}
      <Modal
        visible={showResultModal}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="result-detail-modal"
        centered
      >
        <div className="modal-result-content">
          <div className="modal-result-header">
            <BookOutlined className="modal-icon" />
            <h2>Kết quả chi tiết</h2>
          </div>

          <div className="modal-score-summary">
            <div className="score-item correct">
              <div className="score-number">{correctCount}</div>
              <div className="score-text">Cặp đúng</div>
            </div>
            <div className="score-divider">/</div>
            <div className="score-item total">
              <div className="score-number">{leftArr.length}</div>
              <div className="score-text">Tổng cặp</div>
            </div>
          </div>

          <div className="modal-questions-list">
            {detailedResults.map((result, index) => (
              <Card
                key={index}
                className={`result-question-card ${
                  result.isCorrect ? "correct" : "wrong"
                }`}
              >
                <div className="question-result-header">
                  <span className="question-index">Cặp {index + 1}</span>
                  <span
                    className={`result-badge ${
                      result.isCorrect ? "correct" : "wrong"
                    }`}
                  >
                    {result.isCorrect ? "✓ Đúng" : "✗ Sai"}
                  </span>
                </div>
                <div className="question-content-modal">
                  <p>
                    <strong>Từ vựng:</strong> {result.term}
                  </p>
                  <p>
                    <strong>Bạn đã nối với:</strong> {result.definition}
                  </p>
                  {!result.isCorrect && (
                    <p style={{ color: "#10b981" }}>
                      <strong>Đáp án đúng:</strong>{" "}
                      {flashCardSet.vocabs.find(
                        (v: any) =>
                          typeof v !== "string" && v.term === result.term
                      )?.definition || ""}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleCloseModal}
            className="modal-close-btn"
            block
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
};
