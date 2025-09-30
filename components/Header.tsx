import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HeaderProps {
  onClearHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearHistory }) => {
  return (
    <header className="glass-effect shadow-lg">
      <div className="container mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
        <div className="flex-1"></div> {/* Left spacer to help center the title */}

        <div className="flex items-center justify-center">
          <SparklesIcon className="h-8 w-8 text-indigo-500 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text whitespace-nowrap">
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

export default Header;
