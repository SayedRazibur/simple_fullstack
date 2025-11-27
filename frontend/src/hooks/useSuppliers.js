// src/hooks/useSuppliers.js
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { supplierApi } from '@/services/suppliers.service';

export default function useSuppliers({
  page = 1,
  limit = 10,
  search = '',
  order = 'asc',
  sortBy = 'createdAt',
}) {
  const debouncedSearch = useDebounce(search, 600);

  return useQuery({
    queryKey: [
      'suppliers',
      { page, limit, order, sortBy, search: debouncedSearch },
    ],
    queryFn: () =>
      supplierApi.getAll({
        page,
        limit,
        order,
        sortBy,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
