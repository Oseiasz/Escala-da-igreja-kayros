
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Member, ScheduleParticipant } from '../types';
import { CloseIcon, PlusIcon } from './icons';

interface MultiSelectProps {
  label: string;
  allOptions: Member[];
  selectedOptions: ScheduleParticipant[];
  onChange: (newSelection: ScheduleParticipant[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, allOptions, selectedOptions, onChange, placeholder = "Buscar ou digitar nome..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const availableOptions = useMemo(() => {
        const selectedIds = new Set(selectedOptions.map(p => p.id));
        return allOptions.filter(option => !selectedIds.has(option.id));
    }, [allOptions, selectedOptions]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return availableOptions;
        const lower = searchTerm.toLowerCase();
        return availableOptions.filter(option =>
            option.name.toLowerCase().includes(lower)
        );
    }, [searchTerm, availableOptions]);

    const showAddOption = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return false;
        const lower = term.toLowerCase();
        const exactRegistered = allOptions.some(opt => opt.name.toLowerCase() === lower);
        const exactSelected = selectedOptions.some(opt => opt.name.toLowerCase() === lower);
        return !exactRegistered && !exactSelected;
    }, [searchTerm, allOptions, selectedOptions]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
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
            id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
        <div ref={wrapperRef} className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{label}</label>
            <div className="relative">
                <div className="flex flex-wrap gap-2 items-center p-3 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-[56px] focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    {selectedOptions.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white text-xs font-black uppercase border border-zinc-200 dark:border-zinc-700 shadow-sm animate-in zoom-in-95">
                            {p.name}
                            <button
                                type="button"
                                onClick={() => handleDeselect(p)}
                                className="p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            >
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setIsOpen(true);}}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchTerm.trim()) {
                                e.preventDefault();
                                if (filteredOptions.length === 1 && filteredOptions[0].name.toLowerCase() === searchTerm.trim().toLowerCase()) {
                                    handleSelect(filteredOptions[0]);
                                } else if (showAddOption) {
                                    handleAddUnregistered();
                                }
                            }
                        }}
                        placeholder={selectedOptions.length === 0 ? placeholder : ''}
                        className="flex-grow bg-transparent outline-none text-sm font-bold min-w-[120px] py-1 dark:text-white"
                    />
                </div>

                {isOpen && (searchTerm || filteredOptions.length > 0) && (
                    <div className="absolute z-[160] w-full mt-2 bg-white dark:bg-church-surface border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredOptions.map(option => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className="px-5 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50 last:border-none"
                                >
                                    <span>{option.name}</span>
                                    <span className="text-[9px] uppercase font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">Membro</span>
                                </li>
                            ))}
                            {showAddOption && (
                                <li
                                    onClick={handleAddUnregistered}
                                    className="px-5 py-4 text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer flex items-center gap-2"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Adicionar "{searchTerm.trim()}"</span>
                                </li>
                            )}
                            {filteredOptions.length === 0 && !showAddOption && searchTerm && (
                                <li className="px-5 py-4 text-xs text-zinc-400 dark:text-zinc-500 italic text-center">
                                    Nenhum resultado
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiSelect;
