import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';

const SearchBar = ({ onSearch, placeholder = "Search the archive..." }) => {
    const [ query, setQuery ] = useState('');
    const [ isExpanded, setIsExpanded ] = useState(false);
    const [ showSuggestions, setShowSuggestions ] = useState(false);
    const { handleGetSuggestions } = useProduct();
    const { suggestions, relatedSuggestions } = useSelector(state => state.product);
    const dropdownRef = useRef(null);

    // Debounce search suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 3) {
                handleGetSuggestions(query);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [ query ]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (value) => {
        setQuery(value);
        setShowSuggestions(false);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        setShowSuggestions(false);
        onSearch('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto z-50">
            <form 
                onSubmit={handleSubmit}
                className={`relative flex items-center transition-all duration-500 border-b ${isExpanded || query ? 'border-[#C9A96E]' : 'border-[#e4e2df]'}`}
            >
                <Search className={`w-4 h-4 transition-colors duration-300 ${query ? 'text-[#C9A96E]' : 'text-[#7A6E63]'}`} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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

            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length >= 3) && (suggestions.length > 0 || relatedSuggestions.length > 0) && (
                <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 w-full mt-2 bg-[#fbf9f6] border border-[#e4e2df] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                    style={{ backdropFilter: 'blur(10px)' }}
                >
                    <div className="p-2">
                        {/* Direct Matches */}
                        {suggestions.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#C9A96E' }}>
                                    Found in Pieces
                                </h3>
                                {suggestions.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectSuggestion(item)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-light text-left hover:bg-[#f5f3f0] transition-colors group"
                                        style={{ color: '#1b1c1a' }}
                                    >
                                        <Search className="w-3 h-3 text-[#B5ADA3] group-hover:text-[#C9A96E]" />
                                        <span>{item}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Similarity / Discover Suggestions */}
                        {relatedSuggestions.length > 0 && (
                            <div>
                                <h3 className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2" style={{ color: '#C9A96E' }}>
                                    <Sparkles className="w-3 h-3" />
                                    Discover Something New
                                </h3>
                                <div className="flex flex-wrap gap-2 px-4 py-3">
                                    {relatedSuggestions.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="px-4 py-1.5 text-[11px] uppercase tracking-wider border border-[#d0c5b5] hover:border-[#1b1c1a] hover:bg-[#1b1c1a] hover:text-[#fbf9f6] transition-all duration-300"
                                            style={{ color: '#1b1c1a' }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleSubmit}
                        className="w-full py-3 px-4 border-t border-[#e4e2df] bg-[#f5f3f0] text-[10px] uppercase tracking-[0.25em] font-medium flex items-center justify-between hover:text-[#C9A96E] transition-colors"
                        style={{ color: '#7A6E63' }}
                    >
                        View all results
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
