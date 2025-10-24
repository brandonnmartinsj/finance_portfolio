import React, { useState, useEffect, useRef } from 'react';
import { marketService } from '../services/api';

const TickerSearch = ({ value, onChange, onSelect, assetType, placeholder = 'Digite o ticker ou nome da empresa' }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (assetType !== 'ACAO_US') {
      return;
    }

    setIsLoading(true);

    try {
      const response = await marketService.searchSymbol(searchQuery);
      const filtered = response.data.filter(result =>
        result.type === 'EQUITY' &&
        (result.exchange === 'NMS' || result.exchange === 'NYQ' || result.exchange === 'NGM')
      );
      setResults(filtered.slice(0, 8));
      setShowDropdown(filtered.length > 0);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value.toUpperCase();
    setQuery(newQuery);
    onChange(newQuery);
    setSelectedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(newQuery);
    }, 300);
  };

  const handleSelectResult = (result) => {
    const ticker = result.symbol;
    setQuery(ticker);
    onChange(ticker);
    setShowDropdown(false);

    if (onSelect) {
      onSelect({
        ticker,
        name: result.longname || result.shortname,
        exchange: result.exchange,
        sector: result.sector,
        industry: result.industry
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleFocus = () => {
    if (results.length > 0 && query.length >= 2) {
      setShowDropdown(true);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        style={{ width: '100%' }}
      />

      {isLoading && (
        <div style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#6b7280'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}></div>
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          marginTop: '4px',
          maxHeight: '300px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          {results.map((result, index) => (
            <div
              key={result.symbol}
              onClick={() => handleSelectResult(result)}
              style={{
                padding: '12px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f3f4f6' : 'white',
                borderBottom: index < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div>
                  <span style={{
                    fontWeight: '600',
                    color: '#1f2937',
                    fontSize: '14px'
                  }}>
                    {result.symbol}
                  </span>
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    color: '#6b7280',
                    padding: '2px 6px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '3px'
                  }}>
                    {result.exchange}
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#4b5563',
                marginBottom: '2px'
              }}>
                {result.longname || result.shortname}
              </div>
              {(result.sector || result.industry) && (
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af'
                }}>
                  {result.sector && result.industry
                    ? `${result.sector} • ${result.industry}`
                    : result.sector || result.industry
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && !isLoading && query.length >= 2 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          marginTop: '4px',
          padding: '12px',
          color: '#6b7280',
          fontSize: '13px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          Nenhum resultado encontrado
        </div>
      )}
    </div>
  );
};

export default TickerSearch;
