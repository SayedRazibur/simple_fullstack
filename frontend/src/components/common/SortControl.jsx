import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

/**
 * Reusable SortControl component
 *
 * @param {Object[]} options - Array of { label: string, value: string }
 * @param {string} sortBy - Currently selected sort field
 * @param {string} order - Sort direction ("asc" | "desc")
 * @param {Function} onSortChange - Callback (sortBy, order)
 * @param {string} [className] - Optional custom className for layout
 */
export default function SortControl({
  sortBy,
  order,
  onSortChange,
  options = [],
  className = '',
}) {
  const defaultOptions = [
    { value: 'createdAt', label: 'Created At' },
    { value: 'updatedAt', label: 'Updated At' },
    { value: 'id', label: 'ID' },
  ];

  const combinedOptions = options.length > 0 ? options : defaultOptions;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sort field dropdown */}
      <Select value={sortBy} onValueChange={(v) => onSortChange(v, order)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {combinedOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Asc/Desc toggle button */}
      <button
        type="button"
        onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
        className="flex items-center border rounded px-2 py-1 text-sm hover:bg-muted transition"
      >
        <ArrowUpDown className="h-4 w-4 mr-1" />
        {order === 'asc' ? 'ASC' : 'DESC'}
      </button>
    </div>
  );
}
