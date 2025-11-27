// src/components/common/ClientSelect.jsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useClients from '@/hooks/useClients';

export default function ClientSelect({ value, onValueChange }) {
  const [search, setSearch] = useState('');

  const { data: clientsData } = useClients({
    page: 1,
    limit: 50,
    search,
  });

  const clients = clientsData?.data?.records || [];

  return (
    <Select value={value || 'ALL'} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by Client" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <SelectItem value="ALL">All Clients</SelectItem>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id.toString()}>
            {client.firstName} {client.surname || ''} {client.email ? `- ${client.email}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
