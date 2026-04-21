import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search the archive..." }) => {
    const [ query, setQuery ] = useState('');
    const [ isExpanded, setIsExpanded ] = useState(false);
    const inputRef = useRef(null);

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto z-50">
            <form 
                onSubmit={handleSubmit}
                className={`relative flex items-center transition-all duration-500 border-b ${isExpanded || query ? 'border-[#C9A96E]' : 'border-[#e4e2df]'}`}
            >
                <Search className={`w-4 h-4 transition-colors duration-300 ${query ? 'text-[#C9A96E]' : 'text-[#7A6E63]'}`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsExpanded(true)}
                    onBlur={() => !query && setIsExpanded(false)}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-[#B5ADA3] font-light tracking-wide"
                    style={{ color: '#1b1c1a' }}
                />
                {query && (
                    <button 
                        type="button" 
                        onClick={handleClear}
                        className="p-1 hover:text-[#C9A96E] transition-colors"
                        style={{ color: '#7A6E63' }}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </form>
        </div>
    );
};

export default SearchBar;
