import React from 'react';
import { useDesignStore } from '../store';
import { RotateCw, Trash2, Type, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { LayerControls } from './LayerControls';
import { ImageControls } from './ImageControls';

export const Toolbar = () => {
  const { addElement, selectedElement, updateElement, removeElement } = useDesignStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    handleImageFiles(acceptedFiles);
  }, []);

  const handleImageFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        addElement({
          type: 'image',
          content: reader.result as string,
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          rotation: 0,
          zIndex: 1
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    noClick: true
  });

  const handleRotate = () => {
    if (selectedElement) {
      updateElement(selectedElement, (prev: any) => ({
        rotation: (prev.rotation || 0) + 90
      }));
    }
  };

  const handleAddText = () => {
    addElement({
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: 0,
      zIndex: 1
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleImageFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div {...getRootProps()} className="flex items-center gap-4">
      <input {...getInputProps()} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        multiple
      />
      
      {isDragActive && (
        <div className="fixed inset-0 bg-blue-500/10 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            Drop image here
          </div>
        </div>
      )}

      <button 
        onClick={handleImageClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        <ImageIcon size={20} />
        Add Image
      </button>

      <button
        onClick={handleAddText}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        <Type size={20} />
        Add Text
      </button>

      {selectedElement && (
        <>
          <div className="h-8 w-px bg-gray-200" />
          
          <button
            onClick={handleRotate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCw size={20} />
            Rotate
          </button>

          <button
            onClick={() => removeElement(selectedElement)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
          >
            <Trash2 size={20} />
            Delete
          </button>

          <div className="h-8 w-px bg-gray-200" />
          
          <LayerControls />
          
          <div className="h-8 w-px bg-gray-200" />
          
          <ImageControls />
        </>
      )}
    </div>
  );
};