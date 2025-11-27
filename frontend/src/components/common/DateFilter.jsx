// src/components/common/DateFilter.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function DateFilter({ selectedDate, onDateChange }) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-10 px-0">
            <CalendarIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onDateChange(date || null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {selectedDate && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {format(selectedDate, 'PPP')}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange(null)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
}
