'use client';

import { useState, useEffect, useCallback } from 'react';
import InfiniteCanvas from '@/components/InfiniteCanvas';
import Toolbar from '@/components/Toolbar';
import { CanvasElement, Tool } from '@/types/canvas';

const STORAGE_KEY = 'infinite-canvas-data';

export default function Home() {
  const [currentTool, setCurrentTool] = useState<Tool>('draw');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [filled, setFilled] = useState(false);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setElements(data.elements || []);
        setCurrentColor(data.color || '#000000');
        setBrushSize(data.brushSize || 2);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, []);

  // Auto-save to localStorage whenever elements change
  useEffect(() => {
    if (!mounted) return;
    const data = {
      elements,
      color: currentColor,
      brushSize,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [elements, currentColor, brushSize, mounted]);

  const handleClear = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el lienzo?')) {
      setElements([]);
    }
  }, []);

  const handleSave = useCallback(() => {
    const data = {
      elements,
      color: currentColor,
      brushSize,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [elements, currentColor, brushSize]);

  const handleLoad = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setElements(data.elements || []);
          setCurrentColor(data.color || '#000000');
          setBrushSize(data.brushSize || 2);
        } catch (error) {
          alert('Error al cargar el archivo. Asegúrate de que sea un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        setElements((prev) => [
          ...prev,
          {
            type: 'image',
            id: Date.now().toString(),
            x: 100,
            y: 100,
            width,
            height,
            src: e.target?.result as string,
          },
        ]);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <Toolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        filled={filled}
        setFilled={setFilled}
        onClear={handleClear}
        onSave={handleSave}
        onLoad={handleLoad}
        onImageUpload={handleImageUpload}
      />
      <InfiniteCanvas
        currentTool={currentTool}
        currentColor={currentColor}
        brushSize={brushSize}
        filled={filled}
        elements={elements}
        setElements={setElements}
      />
    </div>
  );
}
