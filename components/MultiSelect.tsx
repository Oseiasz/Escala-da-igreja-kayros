import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Member, ScheduleParticipant } from '../types';
import { CloseIcon } from './icons';

interface MultiSelectProps {
  label: string;
  allOptions: Member[];
  selectedOptions: ScheduleParticipant[];
  onChange: (newSelection: ScheduleParticipant[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, allOptions, selectedOptions, onChange, placeholder = "Buscar membros..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const availableOptions = useMemo(() => {
        const selectedIds = new Set(selectedOptions.map(p => p.id));
        return allOptions.filter(option => !selectedIds.has(option.id));
    }, [allOptions, selectedOptions]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) {
            return availableOptions;
        }
        return availableOptions.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, availableOptions]);

    const showAddOption = useMemo(() => {
        if (!searchTerm.trim()) return false;
        const searchLower = searchTerm.trim().toLowerCase();
        // Check if there's an exact match in all members (registered) or already selected participants
        const exactMatchExists = allOptions.some(opt => opt.name.toLowerCase() === searchLower) || selectedOptions.some(opt => opt.name.toLowerCase() === searchLower);
        return !exactMatchExists;
    }, [searchTerm, allOptions, selectedOptions]);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelect = (member: Member) => {
        const newParticipant: ScheduleParticipant = {
            id: member.id,
            name: member.name,
            isRegistered: true,
            memberData: member,
        };
        onChange([...selectedOptions, newParticipant]);
        setSearchTerm('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleAddUnregistered = () => {
        const newName = searchTerm.trim();
        if (!newName) return;

        const newParticipant: ScheduleParticipant = {
            id: `unregistered_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: newName,
            isRegistered: false,
        };
        onChange([...selectedOptions, newParticipant]);
        setSearchTerm('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleDeselect = (participant: ScheduleParticipant) => {
        onChange(selectedOptions.filter(p => p.id !== participant.id));
    };

    return (
        <div ref={wrapperRef}>
            <label className="block text-md font-semibold text-gray-700 dark:text-slate-300 mb-2">{label}</label>
            <div className="relative">
                <div className="flex flex-wrap gap-2 items-center p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 min-h-[42px]">
                    {selectedOptions.map(p => (
                        <span key={p.id} className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full">
                            {p.name}
                            <button
                                type="button"
                                onClick={() => handleDeselect(p)}
                                className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100 focus:outline-none"
                                aria-label={`Remover ${p.name}`}
                            >
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && showAddOption) {
                                e.preventDefault();
                                handleAddUnregistered();
                            }
                        }}
                        placeholder={selectedOptions.length === 0 ? placeholder : ''}
                        className="flex-grow bg-transparent focus:outline-none text-sm p-1 dark:text-white"
                        aria-label={label}
                    />
                </div>

                {isOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto" role="listbox">
                        {filteredOptions.length > 0 &&
                            filteredOptions.map(option => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className="px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 cursor-pointer"
                                    role="option"
                                    aria-selected="false"
                                >
                                    {option.name}
                                </li>
                            ))
                        }
                        {showAddOption && (
                             <li
                                onClick={handleAddUnregistered}
                                className="px-4 py-2 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 cursor-pointer font-semibold"
                                role="option"
                                aria-selected="false"
                            >
                                Adicionar "{searchTerm.trim()}"
                            </li>
                        )}
                        {filteredOptions.length === 0 && !showAddOption && (
                            <li className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 italic">
                                {searchTerm ? 'Nenhum membro encontrado' : 'Todos os membros já selecionados'}
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MultiSelect;
