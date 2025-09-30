import React, { useEffect, useRef, useState } from 'react';
import type { Interaction, Source } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

// UserIcon SVG component
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
        <path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 4a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
    </svg>
);

const FormattedAnswer: React.FC<{ text: string }> = React.memo(({ text }) => {
    // This function can be expanded with more advanced sanitization if needed
    const getSanitizedHtml = (markdownText: string) => {
        if ((window as any).marked) {
            return (window as any).marked.parse(markdownText);
        }
        return markdownText.replace(/\n/g, '<br />'); // Basic fallback
    };
    
    return (
        <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: getSanitizedHtml(text) }} 
        />
    );
});

const SourceList: React.FC<{ sources: Source[] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-600 mb-2">Nguồn tham khảo:</h4>
            <ul className="list-decimal list-inside space-y-1">
                {sources.map((source, index) => (
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
    );
};


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
            }, 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Không thể sao chép vào clipboard.');
        });
    };
    
    const renderInitialState = () => (
        <div className="flex flex-col items-center justify-center text-center p-8 text-white/80 h-full fade-in">
            <SparklesIcon className="w-16 h-16 text-white/70 mb-4"/>
            <h2 className="text-2xl font-bold mb-2 text-white">Sẵn sàng giải đáp</h2>
            <p>Nhập đề bài của bạn vào ô phía dưới để bắt đầu.</p>
        </div>
    );

    if (history.length === 0) {
        return renderInitialState();
    }
  
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
            {history.map(interaction => (
                <div key={interaction.id} className="glass-effect p-4 sm:p-6 rounded-2xl shadow-lg message-bubble">
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
                         <div className="flex-shrink-0 w-8 h-8 rounded-full btn-primary grid place-content-center">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 relative group">
                             <p className="font-semibold text-slate-800 mb-2">Trợ lý AI</p>
                             
                             {interaction.isLoading && !interaction.modelResponse?.answer && (
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
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
                                        <FormattedAnswer text={interaction.modelResponse.answer} />
                                        <SourceList sources={interaction.modelResponse.sources} />
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

export default SolutionDisplay;
