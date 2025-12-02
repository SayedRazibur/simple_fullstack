// src/components/common/EntitySelect.jsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useReferenceData from '@/hooks/useReferenceData';

export default function EntitySelect({
  value,
  onValueChange,
  allowAll = true,
}) {
  const [search, setSearch] = useState('');

  const { data: entities } = useReferenceData('entities', search);

  return (
    <Select
      value={value || (allowAll ? 'ALL' : '')}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Entity" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search entities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Entities</SelectItem>}
        {entities?.map((entity) => (
          <SelectItem key={entity.id} value={entity.id.toString()}>
            {entity.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
