import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { fileToBase64 } from '../utils/fileUtils';

// SendIcon SVG component
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
);

interface InputAreaProps {
  onSubmit: (text: string, image: { data: string; mimeType: string } | null) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Max height of ~6 lines (24px line-height * 6 + padding)
      const maxHeight = 24 * 6 + 24; 
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [text]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
    }
    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      alert("Image size should be less than 4MB.");
      return;
    }
    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if ((!text.trim() && !image) || isLoading) {
      return;
    }

    let imagePayload: { data: string; mimeType: string } | null = null;
    if (image) {
      try {
        const base64Data = await fileToBase64(image.file);
        imagePayload = { data: base64Data, mimeType: image.file.type };
      } catch (error) {
        console.error("Error converting file to base64", error);
        alert("Could not process image file.");
        return;
      }
    }
    onSubmit(text, imagePayload);
    setText('');
    removeImage(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (showAlert = true) => {
    if (image && showAlert && !window.confirm("Are you sure you want to remove the image?")) {
        return;
    }
    // Revoke the object URL to free up memory
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="glass-effect p-3 rounded-2xl shadow-xl w-full flex flex-col gap-2 relative transition-all duration-200"
    >
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-100/80 backdrop-blur-sm border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center pointer-events-none z-10">
          <p className="text-indigo-600 font-bold text-lg">Thả ảnh vào đây</p>
        </div>
      )}
      {image && (
          <div className="relative group w-24 h-24 self-start">
              <img src={image.preview} alt="Problem preview" className="w-full h-full object-cover rounded-md border border-slate-300" />
              <button 
                  type="button" 
                  onClick={() => removeImage()}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                  disabled={isLoading}
              >
                  X
              </button>
          </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={triggerFileSelect}
          disabled={isLoading}
          className="flex-shrink-0 grid place-content-center w-10 h-10 border border-slate-300/50 text-slate-700 rounded-full hover:bg-white/80 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload image"
        >
          <UploadIcon className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập đề bài hoặc thả ảnh vào đây..."
          className="w-full max-h-40 p-2.5 bg-white/60 border border-slate-300/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition duration-200 resize-none leading-6"
          rows={1}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || (!text.trim() && !image)}
          className="flex-shrink-0 w-10 h-10 rounded-full grid place-content-center btn-primary text-white font-bold focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Submit problem"
        >
          {isLoading ? <LoadingSpinner className="w-6 h-6"/> : <SendIcon className="w-5 h-5"/>}
        </button>
      </form>
    </div>
  );
};

export default InputArea;
