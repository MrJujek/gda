import React, { useState, useRef, useEffect } from "react";
import { User, Chat } from "../pages/Chat";

interface AutocompleteProps {
	options: (User|Chat)[];
	setSelectedOption: React.Dispatch<React.SetStateAction<User|Chat|null>>;
	currentUserId: number;
}

function Autocomplete({ options, setSelectedOption, currentUserId }: AutocompleteProps) {
	const [inputValue, setInputValue] = useState<string>("");
	const [filteredOptions, setFilteredOptions] = useState<string[]>([""]);
	const inputRef = useRef<HTMLInputElement>(null);		

	useEffect(() => {
		setFilteredOptions(options.map(item => {	
			if ('ID' in item && item.ID === currentUserId) {				
				return;
			} else if ('CommonName' in item) {
				return item.CommonName;
			} else if ('GroupName' in item) {
				return item.GroupName.String;
			}
			return;
		}).filter((item): item is string => item !== undefined));

		const handleClickOutside = (event: MouseEvent) => {
			if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
				setFilteredOptions([]);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		setFilteredOptions(options.map(item => {
			if ('ID' in item && item.ID === currentUserId) {
				return;
			} else if ('CommonName' in item) {
				return item.CommonName;
			} else if ('GroupName' in item) {
				return item.GroupName.String;
			}
			return;
		})
		.filter((item): item is string => item !== undefined)
		.filter((option) => option.toLowerCase().includes(value.toLowerCase())));
	};

	const handleOptionClick = (option: string) => {
		setFilteredOptions([]);

		setSelectedOption(options.find((user) => {
			if ('CommonName' in user) {
				return user.CommonName === option;
			} else if ('GroupName' in user) {
				return user.GroupName.String === option;
			}
			return;
		}) || null);
	};

	return (
		<div ref={inputRef} className="relative">
			<input
				type="text"
				value={inputValue}
				onClick={() => {					
					if (inputValue.length == 0) {
						setFilteredOptions(options.map(item => {						
							if ('ID' in item && item.ID === currentUserId) {
								return;
							} else if ('DisplayName' in item) {						
								return item.CommonName;
							} else if ('ChatUUI' in item) {
								return item.ChatUUI;
							}
							return;
						}).filter((item): item is string => item !== undefined));
					}
				}}
				onKeyDown={(e) => {
					if (e.key != "Enter") return
					setInputValue("")

					if (filteredOptions.length == 0) return 

					setSelectedOption(options.find((user) => {
						if ('CommonName' in user) {
							return user.CommonName === filteredOptions[0];
						} else if ('GroupName' in user) {
							return user.GroupName.String === filteredOptions[0];
						}
						return;
					}) || null);
				}}
				onChange={handleInputChange}
				className="text-lg dark:bg-gray-800 dark:text-white border border-gray-500 placeholder:text-gray-500 rounded-md px-4 py-2 w-full duration-100 transition"
				placeholder="Wyszukaj..."
				disabled={options == null}
			/>
			{filteredOptions.length > 0 && (
				<ul className="absolute z-10 left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-500 rounded-md shadow-md">
					{filteredOptions &&
						filteredOptions.map((option, index) => (
							<li
								key={index}
								className="flex dark:text-white items-center px-4 py-2 cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-700"
								onClick={() => handleOptionClick(option)}
							>
								<span>{option}</span>
							</li>
						))}
				</ul>
			)}
		</div>
	);
}

export default Autocomplete;