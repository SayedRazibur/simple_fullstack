import useReferenceData from '@/hooks/useReferenceData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import SearchInput from './SearchInput';

export default function PickupSelect({
  value,
  onValueChange,
  allowAll = false,
}) {
  const [search, setSearch] = useState('');
  const { data: pickups = [], isLoading } = useReferenceData('pickups', search);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select Pickup" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <SearchInput
            placeholder="Search pickups..."
            value={search}
            onChange={setSearch}
            className="mb-2"
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Pickups</SelectItem>}
        {isLoading ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : pickups.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            No pickups found
          </div>
        ) : (
          pickups.map((pickup) => (
            <SelectItem key={pickup.id} value={pickup.id.toString()}>
              {pickup.pickup}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
