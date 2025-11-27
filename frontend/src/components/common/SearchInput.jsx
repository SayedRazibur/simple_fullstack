import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  disabled,
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        disabled={disabled}
      />
    </div>
  );
}
