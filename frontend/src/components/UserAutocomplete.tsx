import React, { useState, useRef, useEffect } from 'react';
import StatusIcon from './StatusIcon';

type User = {
    id: number;
    CommonName: string;
    DisplayName: {
        String: string;
        Valid: boolean;
    }
    Active: boolean;
}

interface AutocompleteProps {
    placeholder: string;
    options: User[];
    setSelected: React.Dispatch<React.SetStateAction<any | null>>;
    currentUserId: number;
}

function UserAutocomplete({ placeholder, options, setSelected, currentUserId }: AutocompleteProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [filteredOptions, setFilteredOptions] = useState<string[]>(["default"]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUserId) {
            setFilteredOptions(options.filter(option => option.id != currentUserId).map(option => option.CommonName || option.DisplayName.String));
        } else {
            setFilteredOptions(options.map(option => option.CommonName || option.DisplayName.String));
        }
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setFilteredOptions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        const filtered = options.filter(option => option.id != currentUserId).filter(option =>
            option.CommonName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered.map(option => option.CommonName || option.DisplayName.String));
    };

    const handleOptionClick = (option: string) => {
        setFilteredOptions([]);
        console.log("option", option);

        setSelected(options.find(user => user.CommonName === option) || null);
    };

    return (
        <div ref={inputRef} className="relative">
            <input
                type="text"
                value={inputValue}
                onClick={() => {
                    if (inputValue.length == 0) {
                        setFilteredOptions(options.map(option => option.CommonName));
                    }
                }}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                placeholder={placeholder}
                disabled={options == null}
            />
            {filteredOptions.length > 0 && (
                <ul className="absolute z-10 left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md">
                    {filteredOptions && filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOptionClick(option)}
                        >
                            <StatusIcon active={options.find(user=>user.CommonName==option)?.Active || false} />
                            <span className="ml-2">{option}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserAutocomplete;