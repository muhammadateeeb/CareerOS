// CareerOS Skills Input - Tag-based Skills Management
// Replaces static skill selection with dynamic tag input

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSkills?: number;
  className?: string;
}

// Common skill suggestions
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
  'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD', 'REST APIs', 'GraphQL',
  'Angular', 'Vue.js', 'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Next.js', 'Express.js',
  'Machine Learning', 'Data Analysis', 'Tableau', 'Excel', 'Power BI', 'Agile', 'Scrum',
  'Project Management', 'Communication', 'Leadership', 'Problem Solving', 'Team Work',
  'DevOps', 'Linux', 'Windows', 'macOS', 'Mobile Development', 'iOS', 'Android',
  'Flutter', 'React Native', 'UI/UX Design', 'Figma', 'Sketch', 'Adobe XD'
];

export function SkillsInput({
  value = [],
  onChange,
  placeholder = "Type a skill and press Enter...",
  disabled = false,
  maxSkills = 20,
  className = ""
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions(COMMON_SKILLS.slice(0, 8));
    } else {
      const filtered = COMMON_SKILLS.filter(skill =>
        skill.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(skill)
      ).slice(0, 8);
      setSuggestions(filtered);
    }
    setSelectedSuggestionIndex(-1);
  }, [inputValue, value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
            addSkill(suggestions[selectedSuggestionIndex]);
          } else if (inputValue.trim()) {
            addSkill(inputValue.trim());
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
          break;
        case 'Tab':
          if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
            e.preventDefault();
            addSkill(suggestions[selectedSuggestionIndex]);
          }
          break;
      }
    } else {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        addSkill(inputValue.trim());
      }
    }
  };

  // Add a skill
  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    
    if (!trimmedSkill || value.includes(trimmedSkill)) {
      return;
    }

    if (value.length >= maxSkills) {
      return;
    }

    onChange([...value, trimmedSkill]);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionsRef.current) {
      const selectedItem = suggestionsRef.current.children[selectedSuggestionIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestionIndex]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Skills tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill, index) => (
            <Badge
              key={`${skill}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <Tag className="h-3 w-3" />
              {skill}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeSkill(skill)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || value.length >= maxSkills}
          className="pr-10"
        />
        
        {/* Add button */}
        {inputValue.trim() && !disabled && value.length < maxSkills && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => addSkill(inputValue)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Character count and limit */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {value.length} skill{value.length !== 1 ? 's' : ''} added
        </span>
        {value.length >= maxSkills && (
          <span className="text-orange-500">
            Maximum {maxSkills} skills reached
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !disabled && value.length < maxSkills && (
        <Card className="absolute z-50 w-full mt-1 p-0 shadow-lg">
          <ul ref={suggestionsRef} className="py-1 max-h-48 overflow-auto">
            {suggestions.map((suggestion, index) => {
              const isSelected = index === selectedSuggestionIndex;
              
              return (
                <li
                  key={suggestion}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors text-sm
                    ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}
                  `}
                  onClick={() => addSkill(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t text-xs text-muted-foreground">
            Press Enter to add skill, ↑↓ to navigate
          </div>
        </Card>
      )}

      {/* No suggestions state */}
      {showSuggestions && suggestions.length === 0 && inputValue.trim() && !disabled && (
        <Card className="absolute z-50 w-full mt-1 p-3 shadow-lg">
          <p className="text-sm text-muted-foreground text-center">
            Press Enter to add "{inputValue}" as a custom skill
          </p>
        </Card>
      )}
    </div>
  );
}
