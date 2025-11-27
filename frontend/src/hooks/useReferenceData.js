import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useDebounce from '@/hooks/useDebounce';
import { referenceDataApi } from '@/services/referenceData.service';

/**
 * Custom hook to manage reference data operations (CRUD)
 * @param {string} model - The reference data model (e.g., 'units', 'services', 'entities'  etc.)
 * @param {string} search - Search term for filtering
 * @returns {Object} - Object containing query and mutation results
 */
export default function useReferenceData(model, search = '') {
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 500);

  // GET ALL
  const getAll = useQuery({
    queryKey: ['referenceData', model, debouncedSearch],
    queryFn: async () => {
      const res = await referenceDataApi.getAll({
        search: debouncedSearch,
        model,
      });
      return res.data || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  // CREATE
  const create = useMutation({
    mutationFn: (data) => referenceDataApi.create(data, model),
    onSuccess: () => {
      toast.success('Created successfully');
      queryClient.invalidateQueries({ queryKey: ['referenceData', model] });
    },
    onError: () => {
      toast.error('Failed to create');
    },
  });

  // UPDATE
  const update = useMutation({
    mutationFn: ({ id, data }) => referenceDataApi.update(id, data, model),
    onSuccess: () => {
      toast.success('Updated successfully');
      queryClient.invalidateQueries({ queryKey: ['referenceData', model] });
    },
    onError: () => {
      toast.error('Failed to update');
    },
  });

  // DELETE
  const delete_ = useMutation({
    mutationFn: (id) => referenceDataApi.delete(id, model),
    onSuccess: () => {
      toast.success('Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['referenceData', model] });
    },
    onError: () => {
      toast.error('Failed to delete');
    },
  });

  return {
    // Queries
    data: getAll.data,
    isLoading: getAll.isLoading,
    isFetching: getAll.isFetching,
    isError: getAll.isError,
    error: getAll.error,
    refetch: getAll.refetch,

    // Mutations
    create,
    update,
    delete: delete_,

    // Utilities
    queryClient,
  };
}
