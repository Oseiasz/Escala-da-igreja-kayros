import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Member } from '../types';
import { CloseIcon } from './icons';

interface MultiSelectProps {
  label: string;
  allOptions: Member[];
  selectedOptions: Member[];
  onChange: (newSelection: Member[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, allOptions, selectedOptions, onChange, placeholder = "Buscar membros..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<Member[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Memoiza a lista de opções disponíveis (ainda não selecionadas) para clareza e desempenho.
    const availableOptions = useMemo(() => {
        const selectedIds = new Set(selectedOptions.map(m => m.id));
        return allOptions.filter(option => !selectedIds.has(option.id));
    }, [allOptions, selectedOptions]);

    // Efeito para atualizar o estado das opções filtradas com base no termo de busca.
    useEffect(() => {
        if (!searchTerm) {
            setFilteredOptions(availableOptions);
        } else {
            setFilteredOptions(
                availableOptions.filter(option =>
                    option.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, availableOptions]);


    // Efeito para lidar com cliques fora do componente para fechar a lista suspensa.
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
        onChange([...selectedOptions, member]);
        setSearchTerm('');
        setIsOpen(true); 
    };

    const handleDeselect = (member: Member) => {
        onChange(selectedOptions.filter(m => m.id !== member.id));
    };

    return (
        <div ref={wrapperRef}>
            <label className="block text-md font-semibold text-gray-700 dark:text-slate-300 mb-2">{label}</label>
            <div className="relative">
                <div className="flex flex-wrap gap-2 items-center p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 min-h-[42px]">
                    {selectedOptions.map(member => (
                        <span key={member.id} className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/70 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full">
                            {member.name}
                            <button
                                type="button"
                                onClick={() => handleDeselect(member)}
                                className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100 focus:outline-none"
                                aria-label={`Remover ${member.name}`}
                            >
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder={selectedOptions.length === 0 ? placeholder : ''}
                        className="flex-grow bg-transparent focus:outline-none text-sm p-1 dark:text-white"
                        aria-label={label}
                    />
                </div>

                {isOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto" role="listbox">
                        {filteredOptions.length > 0 ? (
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
                        ) : (
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