// src/hooks/useClients.js
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { clientApi } from '@/services/clients.service';

export default function useClients({
  page = 1,
  limit = 10,
  search = '',
  order = 'asc',
  sortBy = 'createdAt',
}) {
  const debouncedSearch = useDebounce(search, 600);

  return useQuery({
    queryKey: [
      'clients',
      { page, limit, order, sortBy, search: debouncedSearch },
    ],
    queryFn: () =>
      clientApi.getAll({ page, limit, order, sortBy, search: debouncedSearch }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
