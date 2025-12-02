// src/components/common/SiteSelect.jsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useSites from '@/hooks/useSites';

export default function SiteSelect({ value, onValueChange, allowAll = true }) {
  const [search, setSearch] = useState('');

  const { data: sitesData } = useSites({
    search,
  });

  const sites = sitesData?.data?.data?.records || [];

  return (
    <Select
      value={value || (allowAll ? 'ALL' : '')}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Filter by Site" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Sites</SelectItem>}
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.id.toString()}>
            {site.siteName} - {site.day}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
