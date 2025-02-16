import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlashCardSet } from "@/services/student/FlashCardAPI";
import "./index.css";
import { Button } from "antd";

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
    filterInPlace(edges, edges.filter((o) => equalsNode(edge[0], o[0])));
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
  return original ? original.definition === definition : false;
};

export const FlashCardMatch: React.FC<FlashCardMatchProps> = ({
  flashCardSet,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [edges, setEdges] = useState<[Node, Node][]>([]);

  // Lấy danh sách term và definition từ flashCardSet (xáo trộn ngẫu nhiên)
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

    // Cài đặt kích thước canvas theo container
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

    const onMouseDown = (e: MouseEvent) => {
      if (!mouse) return;
      const closestNode = findClosestNode(nodes, mouse);
      activeNode = closestNode || null;
      isDragging = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseUp = (e: MouseEvent) => {
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
          const isCorrect = isCorrectEdge([start, end], nodes, leftArr, rightArr, flashCardSet);
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
  };

  // Hàm reset cho phép nộp bài lại
  const handleReset = () => {
    setIsSubmitted(false);
    setScore(null);
    setCorrectCount(0);
    // Bạn có thể reset lại các edge nếu muốn cho người dùng làm lại hoàn toàn
    // setEdges([]);
  };

  return (
    <div className="body2">
      <div className="App">
        <div className="Col">
          {leftArr.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
        <canvas ref={canvasRef} className="Lines"></canvas>
        <div className="Col">
          {rightArr.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      </div>
      <center>
        <div className="controls">
          <Button onClick={handleSubmit}>Nộp bài</Button>{" "}
          <Button onClick={handleReset}>Thử lại</Button>
        </div>
        <hr />
        {isSubmitted && <div>Số câu đúng: {correctCount}</div>}
      </center>
    </div>
  );
};
