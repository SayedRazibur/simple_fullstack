import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { purchaseApi } from '@/services/purchases.service';

export default function usePurchases({
  limit = 15,
  page = 1,
  search = '',
  order = 'asc',
  sortBy = 'date',
  pickupId = null,
  supplierId = null,
  day = null,
  date = null,
}) {
  return useQuery({
    queryKey: [
      'purchases',
      {
        limit,
        page,
        order,
        sortBy,
        search,
        pickupId,
        supplierId,
        day,
        date,
      },
    ],
    queryFn: () =>
      purchaseApi.getAll({
        limit,
        page,
        order,
        sortBy,
        search,
        pickupId,
        supplierId,
        day,
        date,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}
