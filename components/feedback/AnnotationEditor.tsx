'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil, Square, Circle, Type, ArrowRight, Minus, Undo, Redo, Eraser, RotateCcw, MousePointer, Trash2 } from 'lucide-react';

interface AnnotationEditorProps {
  screenshot: string;
  onComplete: (annotatedImage: string) => void;
  onCancel: () => void;
}

type Annotation = {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text';
  color: string;
  data: any; // Specific data for each annotation type
};

type TextBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
};

export function AnnotationEditor({
  screenshot,
  onComplete,
  onCancel,
}: AnnotationEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageDataRef = useRef<ImageData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'select' | 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'eraser'>('select');
  const [color, setColor] = useState('#ff0000');
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Text box creation state
  const [isCreatingTextBox, setIsCreatingTextBox] = useState(false);
  const [newTextBox, setNewTextBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [editingTextBoxId, setEditingTextBoxId] = useState<number | null>(null);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate max dimensions (80% of viewport)
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.7;

      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;

      let width = img.width;
      let height = img.height;

      // Scale down if needed while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          // Width is the limiting factor
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          // Height is the limiting factor
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      // Set canvas size to scaled dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the screenshot scaled
      ctx.drawImage(img, 0, 0, width, height);

      // Save base image data (for eraser to restore original)
      baseImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Save initial state to history
      const initialState = canvas.toDataURL();
      setHistory([initialState]);
      setHistoryStep(0);

      // Redraw everything
      redrawCanvas();
    };
    img.src = screenshot;
  }, [screenshot]);

  // Redraw canvas whenever annotations or text boxes change
  useEffect(() => {
    redrawCanvas();
  }, [annotations, textBoxes]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Restore base screenshot
    if (baseImageDataRef.current) {
      ctx.putImageData(baseImageDataRef.current, 0, 0);
    }

    // Redraw all annotations (currently empty, but would render pen/shapes here)

    // Draw all text boxes
    textBoxes.forEach((box, index) => {
      // Only draw text, no frame
      if (box.text) {
        ctx.fillStyle = box.color;
        ctx.font = '16px Arial';

        // Word wrap text inside box
        const words = box.text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > box.width - 10 && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);

        // Draw lines
        lines.forEach((line, i) => {
          ctx.fillText(line, box.x + 5, box.y + 20 + (i * 20));
        });
      }

      // Draw selection highlight
      if (selectedTextBoxId === index) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(box.x - 5, box.y - 5, box.width + 10, box.height + 10);
        ctx.setLineDash([]);
      }
    });
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === 'select') {
      // Check if clicking on a text box
      const clickedBoxId = textBoxes.findIndex(box =>
        pos.x >= box.x && pos.x <= box.x + box.width &&
        pos.y >= box.y && pos.y <= box.y + box.height
      );
      setSelectedTextBoxId(clickedBoxId >= 0 ? clickedBoxId : null);
      return;
    }

    if (tool === 'text') {
      // Start creating text box
      setIsCreatingTextBox(true);
      setNewTextBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
      setStartPos(pos);
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
    } else if (tool === 'eraser') {
      // Eraser logic handled in draw()
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === 'text' && isCreatingTextBox && startPos) {
      // Calculate preview dimensions
      const previewX = Math.min(startPos.x, pos.x);
      const previewY = Math.min(startPos.y, pos.y);
      const previewWidth = Math.abs(pos.x - startPos.x);
      const previewHeight = Math.abs(pos.y - startPos.y);

      // Update text box state
      setNewTextBox({
        x: previewX,
        y: previewY,
        width: previewWidth,
        height: previewHeight,
      });

      redrawCanvas();

      // Draw preview using calculated values immediately (not state)
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(previewX, previewY, previewWidth, previewHeight);
        ctx.setLineDash([]);
      }
      return;
    }

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !startPos) return;

    if (tool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser' && baseImageDataRef.current) {
      // Eraser: restore original screenshot pixels in a circle
      const radius = 10;
      const imageData = baseImageDataRef.current;

      for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
          if (x * x + y * y <= radius * radius) {
            const px = Math.floor(pos.x + x);
            const py = Math.floor(pos.y + y);

            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
              const srcIndex = (py * canvas.width + px) * 4;
              const r = imageData.data[srcIndex];
              const g = imageData.data[srcIndex + 1];
              const b = imageData.data[srcIndex + 2];
              const a = imageData.data[srcIndex + 3];

              ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
              ctx.fillRect(px, py, 1, 1);
            }
          }
        }
      }
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text' && isCreatingTextBox && startPos && newTextBox) {
      const pos = getMousePos(e);
      const finalBox = {
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
      };

      // Only create if box is large enough
      if (finalBox.width > 20 && finalBox.height > 20) {
        setNewTextBox(finalBox);
        setEditingTextBoxId(textBoxes.length);
        setTextInput('');
      }

      setIsCreatingTextBox(false);
      setStartPos(null);
      return;
    }

    if (!isDrawing || !startPos) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    if (tool === 'rectangle') {
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        pos.x - startPos.x,
        pos.y - startPos.y
      );
    } else if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === 'arrow') {
      drawArrow(ctx, startPos.x, startPos.y, pos.x, pos.y);
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    setIsDrawing(false);
    setStartPos(null);

    if (tool !== 'select') {
      saveState();
    }
  };

  const handleTextBoxSubmit = () => {
    if (!textInput.trim() || editingTextBoxId === null || !newTextBox) return;

    const newBox: TextBox = {
      ...newTextBox,
      text: textInput,
      color: color,
    };

    setTextBoxes([...textBoxes, newBox]);
    setTextInput('');
    setEditingTextBoxId(null);
    setNewTextBox(null);
    saveState();
  };

  const handleDeleteSelected = () => {
    if (selectedTextBoxId !== null) {
      setTextBoxes(textBoxes.filter((_, i) => i !== selectedTextBoxId));
      setSelectedTextBoxId(null);
      saveState();
    }
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const annotatedDataUrl = canvas.toDataURL('image/png');
    onComplete(annotatedDataUrl);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newStep = historyStep - 1;
    const previousState = history[newStep];

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;

    setHistoryStep(newStep);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newStep = historyStep + 1;
    const nextState = history[newStep];

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = nextState;

    setHistoryStep(newStep);
  };

  const handleClearAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (baseImageDataRef.current) {
      ctx.putImageData(baseImageDataRef.current, 0, 0);
    }

    setTextBoxes([]);
    setAnnotations([]);
    setSelectedTextBoxId(null);
    saveState();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 p-2 bg-muted rounded-lg flex-wrap">
        <div className="flex items-center gap-3">
          {/* Select Tool */}
          <Button
            type="button"
            variant={tool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('select')}
            title="Select and Move"
          >
            <MousePointer className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Drawing Tools Group */}
          <div className="flex gap-1 p-1.5 border border-border rounded-md bg-background/50">
            <Button
              type="button"
              variant={tool === 'pen' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('pen')}
              title="Freehand Pen"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={tool === 'eraser' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>

          {/* Shapes Group */}
          <div className="flex gap-1 p-1.5 border border-border rounded-md bg-background/50">
            <Button
              type="button"
              variant={tool === 'arrow' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('arrow')}
              title="Arrow"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={tool === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('line')}
              title="Line"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={tool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('rectangle')}
              title="Rectangle"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={tool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool('circle')}
              title="Circle"
            >
              <Circle className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Tool */}
          <Button
            type="button"
            variant={tool === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('text')}
            title="Add Text Box"
          >
            <Type className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Delete Button (only when something is selected) */}
          {selectedTextBoxId !== null && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              title="Delete Selected"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <div className="h-6 w-px bg-border" />

          {/* Color Picker */}
          <div className="flex gap-1">
            {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map((c) => (
              <button
                key={c}
                type="button"
                className={`w-6 h-6 rounded border-2 ${
                  color === c ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* History Controls Group */}
          <div className="flex gap-1 p-1.5 border border-border rounded-md bg-background/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              title="Clear All Annotations"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            if (isDrawing) {
              setIsDrawing(false);
              setStartPos(null);
            }
            if (isCreatingTextBox) {
              setIsCreatingTextBox(false);
              setNewTextBox(null);
            }
          }}
          className={tool === 'select' ? 'cursor-pointer' : 'cursor-crosshair'}
          style={{ display: 'block' }}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-[105] flex justify-center gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="button" onClick={handleComplete}>
          <Check className="mr-2 h-4 w-4" />
          Done
        </Button>
      </div>

      {/* Text Box Input Modal */}
      {editingTextBoxId !== null && newTextBox && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110]">
          <div className="bg-background border-2 border-primary p-4 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Enter Text</h3>
            <textarea
              className="w-full px-3 py-2 border rounded-md text-sm min-h-[100px]"
              placeholder="Type your text here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTextBoxId(null);
                  setTextInput('');
                  setNewTextBox(null);
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleTextBoxSubmit}>
                Add Text
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
