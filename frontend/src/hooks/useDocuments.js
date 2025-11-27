// src/hooks/useDocuments.js
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { documentApi } from '@/services/documents.service';

export default function useDocuments({
  page = 1,
  limit = 10,
  search = '',
  order = 'desc',
  sortBy = 'importedOn',
  date = null,
}) {
  const debouncedSearch = useDebounce(search, 600);

  // Format date to YYYY-MM-DD if provided
  const dateParam = date ? date.toISOString().split('T')[0] : null;

  return useQuery({
    queryKey: [
      'documents',
      { page, limit, order, sortBy, search: debouncedSearch, date: dateParam },
    ],
    queryFn: () =>
      documentApi.getAll({
        page,
        limit,
        order,
        sortBy,
        search: debouncedSearch,
        date: dateParam,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
