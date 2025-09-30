import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import type { Interaction } from '../types';

interface SolutionDisplayProps {
  history: Interaction[];
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ history }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const copyToClipboard = async (text: string, interactionId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [interactionId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [interactionId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatAnswer = (answer: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = answer.split('\n\n');
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-3 last:mb-0">
        {paragraph.split('\n').map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  if (history.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center text-slate-500">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Chào mừng đến với Trợ lý học tập AI!</h3>
          <p className="text-sm">
            Hãy nhập đề bài hoặc tải lên hình ảnh để bắt đầu nhận được giải pháp chi tiết.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {history.map((interaction) => (
          <div key={interaction.id} className="space-y-4">
            {/* User Query */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-indigo-500 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
                <div className="whitespace-pre-wrap break-words">
                  {interaction.userQuery.text}
                </div>
                {interaction.userQuery.image && (
                  <div className="mt-3">
                    <img 
                      src={interaction.userQuery.image} 
                      alt="Problem image" 
                      className="max-w-full h-auto rounded-lg border border-white/20"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="max-w-[90%] bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-slate-200">
                {interaction.isLoading ? (
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner className="w-5 h-5 text-indigo-500" />
                    <span className="text-slate-600">Đang xử lý...</span>
                  </div>
                ) : interaction.error ? (
                  <div className="text-red-600">
                    <div className="font-medium mb-2">Có lỗi xảy ra:</div>
                    <div className="text-sm">{interaction.error}</div>
                  </div>
                ) : (
                  <div>
                    {/* Subject */}
                    {interaction.modelResponse.subject && (
                      <div className="mb-3">
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                          {interaction.modelResponse.subject}
                        </span>
                      </div>
                    )}

                    {/* Answer */}
                    {interaction.modelResponse.answer && (
                      <div className="prose prose-sm max-w-none">
                        <div className="text-slate-800 leading-relaxed">
                          {formatAnswer(interaction.modelResponse.answer)}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {interaction.modelResponse.sources && interaction.modelResponse.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <div className="text-xs text-slate-500 mb-2">Nguồn tham khảo:</div>
                        <div className="space-y-1">
                          {interaction.modelResponse.sources.map((source, index) => (
                            <a
                              key={index}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                            >
                              {source.title || source.uri}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Copy Button */}
                    {interaction.modelResponse.answer && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => copyToClipboard(interaction.modelResponse.answer, interaction.id)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Sao chép câu trả lời"
                        >
                          {copiedStates[interaction.id] ? (
                            <>
                              <CheckIcon className="w-3 h-3 text-green-500" />
                              <span className="text-green-500">Đã sao chép!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="w-3 h-3" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default SolutionDisplay;