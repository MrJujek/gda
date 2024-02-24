import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteProps {
    options: string[];
}

function Autocomplete({ options }: AutocompleteProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
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
        // Filter options based on input value
        const filtered = options.filter(option =>
            option.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    const handleOptionClick = (option: string) => {
        setInputValue(option);
        setFilteredOptions([]);
    };

    return (
        <div ref={inputRef} className="relative">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-4 py-2 w-full"
                placeholder="Type something..."
            />
            {filteredOptions.length > 0 && (
                <ul className="absolute z-10 left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md">
                    {filteredOptions.map((option, index) => (
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

export default Autocomplete;