// src/hooks/useTasks.js
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { taskApi } from '@/services/tasks.service';

export default function useTasks({
  limit = 15,
  cursor = null,
  search = '',
  order = 'asc',
  sortBy = 'date',
  entityId = null,
  productId = null,
  orderId = null,
  documentId = null,
  day = null,
  date = null,
}) {
  const debouncedSearch = useDebounce(search, 600);

  return useQuery({
    queryKey: [
      'tasks',
      {
        limit,
        cursor,
        order,
        sortBy,
        search: debouncedSearch,
        entityId,
        productId,
        orderId,
        documentId,
        day,
        date,
      },
    ],
    queryFn: () =>
      taskApi.getAll({
        limit,
        cursor,
        order,
        sortBy,
        search: debouncedSearch,
        entityId,
        productId,
        orderId,
        documentId,
        day,
        date,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
