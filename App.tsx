import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import SolutionDisplay from './components/SolutionDisplay';
import { solveProblemStream } from './services/geminiService';
import type { Interaction, Source } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<Interaction[]>(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [history]);

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không?")) {
      setHistory([]);
    }
  };

  const handleSolve = async (text: string, image: { data: string; mimeType: string } | null) => {
    setIsLoading(true);

    const interactionId = Date.now();
    const problemImagePreview = image ? `data:${image.mimeType};base64,${image.data}` : undefined;

    const newUserInteraction: Interaction = {
      id: interactionId,
      userQuery: { text, image: problemImagePreview },
      modelResponse: { subject: '', answer: '', sources: [] },
      isLoading: true,
    };

    setHistory(prev => [...prev, newUserInteraction]);

    try {
      const stream = solveProblemStream(text, image);
      let fullText = '';
      const subjectRegex = /^Môn học:\s*(.*)/;
      const accumulatedSources: Source[] = [];
      const sourceUris = new Set<string>();
      
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
        }

        if (chunk.sources) {
          chunk.sources.forEach(source => {
            if (source.uri && !sourceUris.has(source.uri)) {
              accumulatedSources.push(source);
              sourceUris.add(source.uri);
            }
          });
        }

        let subject = 'Đang xác định...';
        let answer = '';

        const lines = fullText.split('\n');
        
        if (lines.length > 0 && subjectRegex.test(lines[0])) {
          const match = lines[0].match(subjectRegex);
          if (match && match[1]) {
            subject = match[1].trim();
          }
          answer = lines.slice(2).join('\n'); // Skip subject line and the blank line
        } else {
          // If the subject line hasn't been streamed yet, treat the whole text as the answer for now
          answer = fullText;
        }

        setHistory(prev => prev.map(item =>
          item.id === interactionId
            ? { ...item, modelResponse: { subject, answer, sources: [...accumulatedSources] } }
            : item
        ));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setHistory(prev => prev.map(item =>
        item.id === interactionId
          ? { ...item, error: errorMessage }
          : item
      ));
    } finally {
      setIsLoading(false);
      setHistory(prev => prev.map(item =>
        item.id === interactionId
          ? { ...item, isLoading: false }
          : item
      ));
    }
  };

  return (
    <div className="h-screen w-screen font-sans text-slate-800 flex flex-col">
      <Header onClearHistory={handleClearHistory} />
      <main className="flex-1 overflow-y-auto pb-24">
        <SolutionDisplay history={history} />
      </main>
      <footer className="fixed bottom-0 left-0 right-0">
        <div className="container mx-auto max-w-4xl p-2 sm:p-4">
          <InputArea onSubmit={handleSolve} isLoading={isLoading} />
           <p className="text-center mt-2 text-xs text-white/70">
            Powered by Google Gemini. © 2024 AI Homework Helper.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
