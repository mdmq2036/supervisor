'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Pencil,
  Type,
  Square,
  Circle,
  Minus,
  Image,
  Hand,
  Trash2,
  Download,
  Upload,
  MousePointer2,
  PaintBucket,
} from 'lucide-react';
import { Tool } from '@/types/canvas';

interface ToolbarProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  filled: boolean;
  setFilled: (filled: boolean) => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  onImageUpload: (file: File) => void;
}

export default function Toolbar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  filled,
  setFilled,
  onClear,
  onSave,
  onLoad,
  onImageUpload,
}: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const tools: { icon: React.ReactNode; tool: Tool; label: string }[] = [
    { icon: <MousePointer2 size={20} />, tool: 'select', label: 'Seleccionar' },
    { icon: <Hand size={20} />, tool: 'pan', label: 'Mover' },
    { icon: <Pencil size={20} />, tool: 'draw', label: 'Dibujar' },
    { icon: <Type size={20} />, tool: 'text', label: 'Texto' },
    { icon: <Square size={20} />, tool: 'rectangle', label: 'Rectángulo' },
    { icon: <Circle size={20} />, tool: 'circle', label: 'Círculo' },
    { icon: <Minus size={20} />, tool: 'line', label: 'Línea' },
    { icon: <Image size={20} />, tool: 'image', label: 'Imagen' },
  ];

  const handleImageClick = () => {
    if (currentTool === 'image') {
      fileInputRef.current?.click();
    } else {
      setCurrentTool('image');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  return (
    <>
      {/* Top Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2 items-center z-10">
        {tools.map(({ icon, tool, label }) => (
          <button
            key={tool}
            onClick={() => (tool === 'image' ? handleImageClick() : setCurrentTool(tool))}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              currentTool === tool ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
            style={{ backgroundColor: currentColor }}
            title="Color"
          />
          {showColorPicker && (
            <div className="absolute top-12 left-0 z-20 bg-white p-3 rounded-lg shadow-xl">
              <HexColorPicker color={currentColor} onChange={setCurrentColor} />
              <button
                onClick={() => setShowColorPicker(false)}
                className="mt-2 w-full px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {/* Brush Size */}
        {(currentTool === 'draw' || currentTool === 'line') && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Grosor:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-6">{brushSize}</span>
          </div>
        )}

        {/* Fill Toggle */}
        {(currentTool === 'rectangle' || currentTool === 'circle') && (
          <button
            onClick={() => setFilled(!filled)}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              filled ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            }`}
            title={filled ? 'Relleno activado' : 'Solo borde'}
          >
            <PaintBucket size={20} />
          </button>
        )}

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Action Buttons */}
        <button
          onClick={onClear}
          className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
          title="Limpiar todo"
        >
          <Trash2 size={20} />
        </button>

        <button
          onClick={onSave}
          className="p-2 rounded hover:bg-green-100 text-green-600 transition-colors"
          title="Guardar"
        >
          <Download size={20} />
        </button>

        <button
          onClick={onLoad}
          className="p-2 rounded hover:bg-blue-100 text-blue-600 transition-colors"
          title="Cargar"
        >
          <Upload size={20} />
        </button>
      </div>

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Help Text */}
      <div className="fixed bottom-4 right-4 bg-white/90 rounded-lg shadow-lg p-3 text-sm text-gray-600 z-10">
        <div className="font-semibold mb-1">Atajos:</div>
        <div>• Rueda del mouse: Zoom in/out</div>
        <div>• Ctrl + Click: Mover lienzo</div>
        <div>• Herramienta Pan: Mover lienzo</div>
      </div>
    </>
  );
}
