import React, { useState, useRef, useEffect } from 'react';

type Chat = {
  ChatUUI: string;
  Encrypted: boolean;
  Group: boolean;
  GroupName: {
    String: string;
    Valid: boolean;
  };
};

interface AutocompleteProps {
    placeholder: string;
    options: Chat[];
    setSelected: React.Dispatch<React.SetStateAction<any | null>>;
}

function GroupAutocomplete({ placeholder, options, setSelected }: AutocompleteProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [filteredOptions, setFilteredOptions] = useState<string[]>(["default"]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFilteredOptions(options.map(option => option.GroupName.String));

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

        const filtered = options.filter(option =>
            option.GroupName.String.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered.map(option => option.GroupName.String));
    };

    const handleOptionClick = (option: string) => {
        setFilteredOptions([]);
        console.log("option", option);

        setSelected(options.find(user => user.GroupName.String === option) || null);
    };

    return (
        <div ref={inputRef} className="relative">
            <input
                type="text"
                value={inputValue}
                onClick={() => {
                    if (inputValue.length == 0) {
                        setFilteredOptions(options.map(option => option.GroupName.String));
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
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GroupAutocomplete;