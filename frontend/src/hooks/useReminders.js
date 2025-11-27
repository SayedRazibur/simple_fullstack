import { useQuery, keepPreviousData } from '@tanstack/react-query';

import useDebounce from '@/hooks/useDebounce';
import { reminderApi } from '@/services/reminders.service';

export default function useReminders({
  limit = 15,
  search = '',
  order = 'desc',
  sortBy = 'date',
  cursor = null,
  entityId = null,
  documentId = null,
}) {
  const debouncedSearch = useDebounce(search, 600);
  return useQuery({
    queryKey: [
      'reminders',
      {
        limit,
        order,
        sortBy,
        search: debouncedSearch,
        cursor,
        entityId,
        documentId,
      },
    ],
    queryFn: () =>
      reminderApi.getAll({
        limit,
        order,
        sortBy,
        search: debouncedSearch,
        cursor,
        entityId,
        documentId,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}
