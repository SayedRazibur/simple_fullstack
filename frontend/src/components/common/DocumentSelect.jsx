// src/components/common/DocumentSelect.jsx
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useDocuments from '@/hooks/useDocuments';

export default function DocumentSelect({
  value,
  onValueChange,
  allowAll = false,
  uploadedDocument = null,
}) {
  const [search, setSearch] = useState('');

  const { data: documentsData } = useDocuments({
    page: 1,
    limit: 50,
    search,
    sortBy: 'importedOn',
    order: 'desc',
  });

  const documents = documentsData?.data?.records || [];

  // Ensure uploaded document is in the list if provided
  const displayDocuments = useMemo(() => {
    if (!uploadedDocument) return documents;
    const exists = documents.find((d) => d.id === uploadedDocument.id);
    if (exists) return documents;
    return [uploadedDocument, ...documents];
  }, [documents, uploadedDocument]);

  return (
    <Select
      value={value || (allowAll ? 'ALL' : '')}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Document" />
      </SelectTrigger>
      <SelectContent align="start" side="bottom">
        <div className="px-2 py-1.5">
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {allowAll && <SelectItem value="ALL">All Documents</SelectItem>}
        {displayDocuments.map((doc) => (
          <SelectItem key={doc.id} value={doc.id.toString()}>
            {doc.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
