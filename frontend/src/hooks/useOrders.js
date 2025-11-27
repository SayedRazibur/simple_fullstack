// src/hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { orderApi } from '@/services/orders.service';
import { toast } from 'sonner';

export default function useOrders({
  page = 1,
  limit = 10,
  pickupId = '',
  orderTypeId = '',
  serviceId = '',
  clientId = '',
  search = '',
  date = null,
}) {
  const debouncedSearch = useDebounce(search, 600);

  return useQuery({
    queryKey: [
      'orders',
      { page, limit, pickupId, orderTypeId, serviceId, clientId, search: debouncedSearch, date },
    ],
    queryFn: () =>
      orderApi.getAll({ 
        page,
        limit, 
        pickupId, 
        orderTypeId, 
        serviceId,
        clientId,
        search: debouncedSearch,
        date: date ? date.toISOString() : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => orderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order');
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => orderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    },
  });
}
