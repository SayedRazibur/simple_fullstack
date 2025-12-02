import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { siteApi } from '@/services/sites.service';

export default function useSites({
  day = null,
  supervisor = null,
  search = '',
}) {
  return useQuery({
    queryKey: ['sites', { day, supervisor, search }],
    queryFn: () =>
      siteApi.getAll({
        day,
        supervisor,
        search,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
