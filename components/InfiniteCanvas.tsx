'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasElement, Tool, Point, ViewportState } from '@/types/canvas';

interface InfiniteCanvasProps {
  currentTool: Tool;
  currentColor: string;
  brushSize: number;
  filled: boolean;
  elements: CanvasElement[];
  setElements: (elements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => void;
}

export default function InfiniteCanvas({
  currentTool,
  currentColor,
  brushSize,
  filled,
  elements,
  setElements,
}: InfiniteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [tempText, setTempText] = useState('');
  const [tempTextPos, setTempTextPos] = useState<Point | null>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (screenX - rect.left - viewport.x) / viewport.zoom,
        y: (screenY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // Preload images
  useEffect(() => {
    elements.forEach((element) => {
      if (element.type === 'image' && !imageCache.current.has(element.src)) {
        const img = new Image();
        img.src = element.src;
        img.onload = () => {
          imageCache.current.set(element.src, img);
          redraw();
        };
      }
    });
  }, [elements]);

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transformation
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Draw grid
    drawGrid(ctx);

    // Draw all elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // Draw current path if drawing
    if (isDrawing && currentPath.length > 0 && currentTool === 'draw') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    }

    // Draw shape preview
    if (isDrawing && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor;
      ctx.lineWidth = brushSize;

      if (currentTool === 'rectangle') {
        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;
        if (filled) {
          ctx.fillRect(startPoint.x, startPoint.y, width, height);
        } else {
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        }
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
        if (filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      } else if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [viewport, elements, isDrawing, currentPath, startPoint, currentTool, currentColor, brushSize, filled]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 50;
    const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize;
    const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize;
    const endX = startX + (ctx.canvas.width / viewport.zoom) + gridSize;
    const endY = startY + (ctx.canvas.height / viewport.zoom) + gridSize;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / viewport.zoom;
    ctx.beginPath();

    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }

    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }

    ctx.stroke();
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;

    switch (element.type) {
      case 'drawing':
        ctx.lineWidth = element.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        if (element.points.length > 0) {
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => ctx.lineTo(point.x, point.y));
        }
        ctx.stroke();
        break;

      case 'text':
        ctx.font = `${element.fontSize}px Arial`;
        ctx.fillText(element.text, element.x, element.y);
        break;

      case 'rectangle':
        if (element.filled) {
          ctx.fillRect(element.x, element.y, element.width, element.height);
        } else {
          ctx.lineWidth = 2;
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
        if (element.filled) {
          ctx.fill();
        } else {
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        break;

      case 'line':
        ctx.lineWidth = element.width;
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
        break;

      case 'image':
        const img = imageCache.current.get(element.src);
        if (img && img.complete) {
          ctx.drawImage(img, element.x, element.y, element.width, element.height);
        }
        break;
    }
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = screenToCanvas(e.clientX, e.clientY);

    if (currentTool === 'pan' || e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (currentTool === 'text') {
      setTempTextPos(point);
      setTempText('');
      setEditingTextId('new');
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPath([point]);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setViewport((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    const point = screenToCanvas(e.clientX, e.clientY);
    setCurrentPath((prev) => [...prev, point]);
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (!isDrawing || !startPoint) return;

    const point = screenToCanvas(e.clientX, e.clientY);

    if (currentTool === 'draw') {
      setElements((prev) => [
        ...prev,
        {
          type: 'drawing',
          id: Date.now().toString(),
          points: currentPath,
          color: currentColor,
          width: brushSize,
        },
      ]);
    } else if (currentTool === 'rectangle') {
      setElements((prev) => [
        ...prev,
        {
          type: 'rectangle',
          id: Date.now().toString(),
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y),
          width: Math.abs(point.x - startPoint.x),
          height: Math.abs(point.y - startPoint.y),
          color: currentColor,
          filled,
        },
      ]);
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
      );
      setElements((prev) => [
        ...prev,
        {
          type: 'circle',
          id: Date.now().toString(),
          x: startPoint.x,
          y: startPoint.y,
          radius,
          color: currentColor,
          filled,
        },
      ]);
    } else if (currentTool === 'line') {
      setElements((prev) => [
        ...prev,
        {
          type: 'line',
          id: Date.now().toString(),
          x1: startPoint.x,
          y1: startPoint.y,
          x2: point.x,
          y2: point.y,
          color: currentColor,
          width: brushSize,
        },
      ]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setStartPoint(null);
  };

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const point = screenToCanvas(e.clientX, e.clientY);

    setViewport((prev) => {
      const newZoom = Math.max(0.1, Math.min(5, prev.zoom * zoomFactor));
      const zoomRatio = newZoom / prev.zoom;

      return {
        zoom: newZoom,
        x: e.clientX - point.x * newZoom,
        y: e.clientY - point.y * newZoom,
      };
    });
  };

  // Handle text submission
  const handleTextSubmit = () => {
    if (tempText.trim() && tempTextPos && editingTextId === 'new') {
      setElements((prev) => [
        ...prev,
        {
          type: 'text',
          id: Date.now().toString(),
          x: tempTextPos.x,
          y: tempTextPos.y,
          text: tempText,
          color: currentColor,
          fontSize: 24,
        },
      ]);
    }
    setEditingTextId(null);
    setTempText('');
    setTempTextPos(null);
  };

  // Resize canvas to match window
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  // Redraw when dependencies change
  useEffect(() => {
    redraw();
  }, [redraw]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: currentTool === 'pan' || isPanning ? 'grab' : 'crosshair' }}
      />
      {editingTextId === 'new' && tempTextPos && (
        <div
          className="absolute"
          style={{
            left: tempTextPos.x * viewport.zoom + viewport.x,
            top: tempTextPos.y * viewport.zoom + viewport.y,
          }}
        >
          <input
            type="text"
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') {
                setEditingTextId(null);
                setTempText('');
                setTempTextPos(null);
              }
            }}
            onBlur={handleTextSubmit}
            autoFocus
            className="border-2 border-blue-500 px-2 py-1 text-xl"
            style={{ color: currentColor }}
          />
        </div>
      )}
    </>
  );
}
