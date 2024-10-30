import React from 'react';
import { Rnd } from 'react-rnd';
import { useDesignStore } from '../store';
import { TextEditor } from './TextEditor';

export const Canvas = () => {
  const { elements, selectedElement, updateElement, setSelectedElement, canvasSize } = useDesignStore();
  const [editingText, setEditingText] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const maxWidth = parent.clientWidth * 0.9;
      const maxHeight = window.innerHeight * 0.7;
      
      const scaleX = maxWidth / canvasSize.width;
      const scaleY = maxHeight / canvasSize.height;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasSize]);

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const handleDoubleClick = (element: any) => {
    if (element.type === 'text') {
      setEditingText(element.id);
    }
  };

  return (
    <div className="flex justify-center">
      <div 
        ref={containerRef}
        className="canvas-container relative bg-white shadow-lg overflow-hidden"
        style={{ 
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
        onClick={() => setSelectedElement(null)}
      >
        {sortedElements.map((element) => (
          <Rnd
            key={element.id}
            position={{ x: element.x, y: element.y }}
            size={{ width: element.width, height: element.height }}
            onDragStart={() => {
              setIsDragging(true);
              setSelectedElement(element.id);
            }}
            onDrag={(e, d) => {
              // Update position in real-time during drag
              updateElement(element.id, { x: d.x, y: d.y });
            }}
            onDragStop={() => {
              setIsDragging(false);
            }}
            onResizeStart={() => {
              setIsDragging(true);
              setSelectedElement(element.id);
            }}
            onResize={(e, direction, ref, delta, position) => {
              // Update size in real-time during resize
              updateElement(element.id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: position.x,
                y: position.y,
              });
            }}
            onResizeStop={() => {
              setIsDragging(false);
            }}
            className={`${
              selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
            } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element.id);
            }}
            onDoubleClick={() => handleDoubleClick(element)}
            style={{ 
              zIndex: element.zIndex,
              touchAction: 'none'
            }}
            bounds="parent"
            dragHandleClassName="drag-handle"
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true
            }}
            resizeHandleClasses={{
              top: 'resize-handle top',
              right: 'resize-handle right',
              bottom: 'resize-handle bottom',
              left: 'resize-handle left',
              topRight: 'resize-handle top-right',
              bottomRight: 'resize-handle bottom-right',
              bottomLeft: 'resize-handle bottom-left',
              topLeft: 'resize-handle top-left'
            }}
            scale={scale}
          >
            {element.type === 'image' ? (
              <div
                className="w-full h-full drag-handle group"
                style={{
                  border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000'}` : 'none'
                }}
              >
                <img
                  src={element.content}
                  alt=""
                  className="w-full h-full object-cover select-none"
                  style={{ 
                    transform: `rotate(${element.rotation}deg)`,
                    pointerEvents: isDragging ? 'none' : 'auto'
                  }}
                  draggable="false"
                />
              </div>
            ) : (
              editingText === element.id ? (
                <TextEditor
                  initialText={element.content}
                  onSave={(text) => {
                    updateElement(element.id, { content: text });
                    setEditingText(null);
                  }}
                  onCancel={() => setEditingText(null)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl cursor-text drag-handle select-none"
                  style={{ 
                    transform: `rotate(${element.rotation}deg)`,
                    pointerEvents: isDragging ? 'none' : 'auto'
                  }}
                >
                  {element.content}
                </div>
              )
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
};