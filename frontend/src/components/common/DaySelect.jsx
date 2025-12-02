// src/components/common/DaySelect.jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
  { value: 'SUN', label: 'Sunday' },
];

export default function DaySelect({ value, onValueChange, allowAll = true }) {
  return (
    <Select
      value={value || (allowAll ? 'ALL' : '')}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Day" />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value="ALL">All Days</SelectItem>}
        {!allowAll && <SelectItem value="NONE">None</SelectItem>}
        {DAYS.map((day) => (
          <SelectItem key={day.value} value={day.value}>
            {day.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
