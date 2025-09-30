import React, { useState, useRef, useEffect } from 'react';

// Types
interface UserQuery {
  text: string;
  image?: string;
}

interface Source {
  uri: string;
  title: string;
}

interface ModelResponse {
  subject: string;
  answer: string;
  sources: Source[];
}

interface Interaction {
  id: number;
  userQuery: UserQuery;
  modelResponse: ModelResponse;
  isLoading: boolean;
  error?: string;
}

// Icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 4a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
  </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Header Component
const Header: React.FC<{ onClearHistory: () => void }> = ({ onClearHistory }) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/50">
      <div className="container mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center">
          <SparklesIcon className="h-8 w-8 text-indigo-500 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
            Trợ lý học tập AI
          </h1>
        </div>
        <div className="flex-1 flex justify-end">
          <button 
            onClick={onClearHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200"
            aria-label="Xóa cuộc trò chuyện"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Input Area Component
const InputArea: React.FC<{ onSubmit: (text: string, image: string | null) => void; isLoading: boolean }> = ({ onSubmit, isLoading }) => {
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
      const maxHeight = 24 * 6 + 24;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [text]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Vui lòng chọn file ảnh.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert("Kích thước ảnh phải nhỏ hơn 4MB.");
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

    const imagePreview = image ? image.preview : null;
    onSubmit(text, imagePreview);
    setText('');
    removeImage(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (showAlert = true) => {
    if (image && showAlert && !window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
      return;
    }
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
      className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl w-full flex flex-col gap-2 relative transition-all duration-200 border border-slate-200/50"
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
          className="flex-shrink-0 w-10 h-10 rounded-full grid place-content-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold focus:outline-none transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
          aria-label="Submit problem"
        >
          {isLoading ? <LoadingSpinner className="w-6 h-6"/> : <SendIcon className="w-5 h-5"/>}
        </button>
      </form>
    </div>
  );
};

// Solution Display Component
const SolutionDisplay: React.FC<{ history: Interaction[] }> = ({ history }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCopy = (textToCopy: string, id: number) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Không thể sao chép vào clipboard.');
    });
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 text-white/80 h-full">
        <SparklesIcon className="w-16 h-16 text-white/70 mb-4"/>
        <h2 className="text-2xl font-bold mb-2 text-white">Sẵn sàng giải đáp</h2>
        <p>Nhập đề bài của bạn vào ô phía dưới để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
      {history.map(interaction => (
        <div key={interaction.id} className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200/50">
          {/* User Query */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 grid place-content-center">
              <UserIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 mb-2">Bạn</p>
              <div className="text-slate-700 space-y-3">
                {interaction.userQuery.image && (
                  <img src={interaction.userQuery.image} alt="Problem" className="max-w-xs h-auto rounded-md border" />
                )}
                {interaction.userQuery.text && (
                  <p className="whitespace-pre-wrap">{interaction.userQuery.text}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Model Response */}
          <div className="flex items-start gap-4 mt-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 grid place-content-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 relative group">
              <p className="font-semibold text-slate-800 mb-2">Trợ lý AI</p>
              
              {interaction.isLoading && !interaction.modelResponse?.answer && (
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  </div>
                  <span>AI đang suy nghĩ...</span>
                </div>
              )}
              
              {interaction.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                  <p className="font-bold">Đã xảy ra lỗi</p>
                  <p>{interaction.error}</p>
                </div>
              )}

              {interaction.modelResponse?.answer && (
                <>
                  <button
                    onClick={() => handleCopy(interaction.modelResponse.answer, interaction.id)}
                    className="absolute top-0 right-0 z-10 p-1.5 rounded-lg text-slate-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-slate-200/80"
                    aria-label="Sao chép lời giải"
                    title="Sao chép lời giải"
                  >
                    {copiedId === interaction.id 
                      ? <CheckIcon className="w-5 h-5 text-green-600" /> 
                      : <ClipboardIcon className="w-5 h-5" />
                    }
                  </button>
                  <div className="space-y-4">
                    {interaction.modelResponse.subject && (
                      <p className="text-sm font-bold text-indigo-700 bg-indigo-100 inline-block px-3 py-1 rounded-full">{interaction.modelResponse.subject}</p>
                    )}
                    <div className="prose prose-slate max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: interaction.modelResponse.answer.replace(/\n/g, '<br />') }} />
                    </div>
                    {interaction.modelResponse.sources && interaction.modelResponse.sources.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-600 mb-2">Nguồn tham khảo:</h4>
                        <ul className="list-decimal list-inside space-y-1">
                          {interaction.modelResponse.sources.map((source, index) => (
                            <li key={index} className="text-sm">
                              <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline break-words"
                                title={source.title}
                              >
                                {source.title || source.uri}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [history, setHistory] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không?")) {
      setHistory([]);
    }
  };

  const handleSolve = async (text: string, imagePreview: string | null) => {
    setIsLoading(true);

    const interactionId = Date.now();

    const newUserInteraction: Interaction = {
      id: interactionId,
      userQuery: { text, image: imagePreview || undefined },
      modelResponse: { subject: 'Đang phân tích...', answer: '', sources: [] },
      isLoading: true,
    };

    setHistory(prev => [...prev, newUserInteraction]);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const demoResponse = `### Lời giải chi tiết\n\nĐây là câu trả lời mô phỏng từ AI. Trong môi trường thực tế, đây sẽ là kết quả từ Google Gemini API.\n\n**Lưu ý:** Code này đã được sửa để không sử dụng localStorage, giúp tránh lỗi màn hình xanh trong Claude.ai artifacts.`;
      
      setHistory(prev => prev.map(item =>
        item.id === interactionId
          ? { 
              ...item, 
              modelResponse: { 
                subject: 'Demo', 
                answer: demoResponse, 
                sources: [] 
              },
              isLoading: false 
            }
          : item
      ));
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="h-screen w-screen font-sans text-slate-800 flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Header onClearHistory={handleClearHistory} />
      <main className="flex-1 overflow-y-auto pb-24">
        <SolutionDisplay history={history} />
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl p-2 sm:p-4">
          <InputArea onSubmit={handleSolve} isLoading={isLoading} />
          <p className="text-center mt-2 text-xs text-slate-500">
            Powered by Google Gemini. © 2024 AI Homework Helper.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
