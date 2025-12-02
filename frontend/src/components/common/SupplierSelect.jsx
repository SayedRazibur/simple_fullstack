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

export default function SupplierSelect({
  value,
  onValueChange,
  allowAll = false,
}) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useReferenceData('supplier', search);

  const suppliers = data?.records || [];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select Supplier" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <SearchInput
            placeholder="Search suppliers..."
            value={search}
            onChange={setSearch}
            className="mb-2"
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Suppliers</SelectItem>}
        {isLoading ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            No suppliers found
          </div>
        ) : (
          suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id.toString()}>
              {supplier.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
