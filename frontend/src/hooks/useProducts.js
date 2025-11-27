// src/hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import useDebounce from '@/hooks/useDebounce';
import { productApi } from '@/services/products.service';
import { toast } from 'sonner';

// Hook for fetching all products with pagination, search, and sort
export default function useProducts({
  page = 1,
  limit = 10,
  search = '',
  order = 'asc',
  sortBy = 'createdAt',
  supplierId = '',
}) {
  const debouncedSearch = useDebounce(search, 600);

  return useQuery({
    queryKey: [
      'products',
      { page, limit, order, sortBy, search: debouncedSearch, supplierId },
    ],
    queryFn: () =>
      productApi.getAll({
        page,
        limit,
        order,
        sortBy,
        search: debouncedSearch,
        supplierId,
      }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Hook for fetching a single product by ID
export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

// Hook for creating a product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });
}

// Hook for updating a product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });
}

// Hook for deleting a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });
}
