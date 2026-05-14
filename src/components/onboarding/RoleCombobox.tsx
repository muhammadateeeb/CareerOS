// CareerOS Role Combobox - Searchable Target Role Input
// Replaces hardcoded dropdowns with dynamic role suggestions

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchRoles, getAllRoles, getCategoryForRole } from '@/data/roles';

interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RoleCombobox({
  value,
  onChange,
  placeholder = "Search or enter your target role...",
  disabled = false,
  className = ""
}: RoleComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Show popular roles when no search query
      setSuggestions(getAllRoles().slice(0, 10));
    } else {
      // Show filtered suggestions
      const filtered = searchRoles(searchQuery);
      // Add the search query as a custom option if it's not in suggestions
      if (!filtered.includes(searchQuery.trim()) && searchQuery.trim().length > 2) {
        filtered.unshift(searchQuery.trim());
      }
      setSuggestions(filtered.slice(0, 10));
    }
    setSelectedIndex(-1);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setSearchQuery(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectRole(suggestions[selectedIndex]);
        } else if (searchQuery.trim()) {
          selectRole(searchQuery.trim());
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery(value);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Handle role selection
  const selectRole = (role: string) => {
    onChange(role);
    setSearchQuery(role);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
    
    // If user is typing, update the value immediately for free-text input
    if (newValue.trim()) {
      onChange(newValue);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchQuery(value);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const selectedCategory = value ? getCategoryForRole(value) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        
        {/* Search icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isOpen ? (
            <Search className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Clear button */}
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              onChange('');
              setSearchQuery('');
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Selected role category badge */}
      {selectedCategory && (
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {selectedCategory}
          </Badge>
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          <ul ref={listRef} className="py-1">
            {suggestions.map((role, index) => {
              const category = getCategoryForRole(role);
              const isSelected = index === selectedIndex;
              const isCustomRole = !getAllRoles().includes(role);

              return (
                <li
                  key={role}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors
                    ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}
                    ${isCustomRole ? 'text-blue-600' : ''}
                  `}
                  onClick={() => selectRole(role)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{role}</span>
                    <div className="flex items-center gap-2">
                      {category && (
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      )}
                      {isCustomRole && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t text-xs text-muted-foreground">
            {searchQuery.trim() && !getAllRoles().includes(searchQuery.trim()) 
              ? "Press Enter to use custom role"
              : "↑↓ to navigate, Enter to select, Esc to close"
            }
          </div>
        </div>
      )}

      {/* No suggestions state */}
      {isOpen && suggestions.length === 0 && searchQuery.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-3">
          <p className="text-sm text-muted-foreground text-center">
            No roles found. Press Enter to use "{searchQuery}" as a custom role.
          </p>
        </div>
      )}
    </div>
  );
}
