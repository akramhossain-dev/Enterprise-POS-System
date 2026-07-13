'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
}

function SearchBox({
  onSearch,
  debounceMs = 300,
  loading = false,
  className,
  placeholder = 'Search…',
  ...props
}: SearchBoxProps) {
  const [value, setValue] = React.useState('');
  const debouncedValue = useDebounce(value, debounceMs);

  React.useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search
        className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-9 py-1 text-sm shadow-sm',
          'placeholder:text-muted-foreground',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-label={placeholder}
        {...props}
      />
      {value && !loading && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {loading && (
        <div
          className="absolute right-3 w-3.5 h-3.5 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
          role="status"
          aria-label="Searching"
        />
      )}
    </div>
  );
}

export { SearchBox };
