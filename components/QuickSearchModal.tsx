import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Member, Schedule, ScheduleDay } from '../types';
import { SearchIcon, UserIcon, CalendarIcon } from './icons';
import Avatar from './Avatar';

type SearchResult = 
  | { type: 'member'; data: Member }
  | { type: 'task'; data: ScheduleDay };

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMembers: Member[];
  schedule: Schedule;
  onSelectMember: (member: Member) => void;
  onSelectTask: (day: ScheduleDay) => void;
}

const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  allMembers,
  schedule,
  onSelectMember,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reset state
      setQuery('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query) {
      setResults([]);
      setActiveIndex(0);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();

    // Search Members
    const memberResults: SearchResult[] = allMembers
        .filter(m => m.name.toLowerCase().includes(lowerCaseQuery))
        .map(member => ({ type: 'member', data: member }));
        
    // Search Tasks
    const taskResults: SearchResult[] = [];
    schedule.forEach(day => {
        if (!day.active) return;
        
        const eventMatch = day.event.toLowerCase().includes(lowerCaseQuery);
        const memberMatch = day.doorkeepers.some(m => m.name.toLowerCase().includes(lowerCaseQuery)) || day.hymnSingers.some(m => m.name.toLowerCase().includes(lowerCaseQuery));
        
        if (eventMatch || memberMatch) {
            taskResults.push({ type: 'task', data: day });
        }
    });

    const uniqueTaskResults = [...new Map(taskResults.map(item => [item.data.id, item])).values()];
    
    setResults([...memberResults, ...uniqueTaskResults]);
    setActiveIndex(0);
  }, [query, allMembers, schedule]);
  
  // Keyboard navigation logic
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + results.length) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [isOpen, results, activeIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    resultsRef.current?.children[activeIndex]?.scrollIntoView({
        block: 'nearest',
    });
  }, [activeIndex]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'member') {
      onSelectMember(result.data);
    } else {
      onSelectTask(result.data);
    }
  };

  const { memberResults, taskResults } = useMemo(() => {
    return {
      memberResults: results.filter(r => r.type === 'member'),
      taskResults: results.filter(r => r.type === 'task'),
    };
  }, [results]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-slate-900 bg-opacity-60 z-50 flex justify-center items-start pt-16 sm:pt-24 p-4"
        onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xl transform transition-all flex flex-col max-h-[70vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <SearchIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Pesquisar membros ou tarefas..."
                className="w-full bg-transparent p-2 pl-10 pr-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
        </div>
        
        <div className="overflow-y-auto">
            {results.length > 0 ? (
                <ul ref={resultsRef}>
                    {memberResults.length > 0 && (
                        <li className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 sticky top-0">Membros</li>
                    )}
                    {memberResults.map((result, index) => (
                        <li
                            key={`member-${result.data.id}`}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${activeIndex === index ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}
                        >
                            <Avatar member={result.data} className="w-8 h-8" />
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.data.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{result.data.email}</p>
                            </div>
                        </li>
                    ))}

                    {taskResults.length > 0 && (
                        <li className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 sticky top-0">Tarefas na Escala</li>
                    )}
                    {taskResults.map((result, index) => {
                        const overallIndex = memberResults.length + index;
                        return (
                            <li
                                key={`task-${result.data.id}`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setActiveIndex(overallIndex)}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer ${activeIndex === overallIndex ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}
                            >
                                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.data.event}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{result.data.dayName}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center p-8 text-sm text-slate-500 dark:text-slate-400">
                    {query ? 'Nenhum resultado encontrado.' : 'Comece a digitar para pesquisar.'}
                </div>
            )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2 text-xs text-slate-500 dark:text-slate-400 text-center">
            Navegue com <kbd className="font-sans font-semibold mx-1">↑</kbd> <kbd className="font-sans font-semibold mx-1">↓</kbd> e selecione com <kbd className="font-sans font-semibold mx-1">Enter</kbd>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;