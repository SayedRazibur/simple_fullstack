import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { openProductApi } from '@/services/openProducts.service';

export default function useOpenProducts({ siteId = null, date = null }) {
  return useQuery({
    queryKey: ['openProducts', { siteId, date }],
    queryFn: () =>
      openProductApi.getAll({
        siteId,
        date,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
