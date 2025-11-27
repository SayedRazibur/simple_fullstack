// src/pages/Suppliers.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSuppliers from '@/hooks/useSuppliers';
import SupplierFormDialog from '@/components/suppliers/SupplierFormDialog';
import PaginationControls from '@/components/common/PaginationControls';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supplierApi } from '@/services/suppliers.service';
import SortControl from '@/components/common/SortControl';
import { toast } from 'sonner';

export default function Suppliers() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('asc');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactMethod: '',
  });

  const { data, isLoading, isFetching, isError, refetch } = useSuppliers({
    page,
    limit: 10,
    search,
    order, // 'asc', 'desc'
    sortBy, // 'name', 'email', 'createdAt'
  });

  const suppliers = data?.data?.records || [];
  const pagination = data?.data?.pagination;

  const saveSupplier = useMutation({
    mutationFn: (supplier) =>
      editingSupplier
        ? supplierApi.update(editingSupplier.id, supplier)
        : supplierApi.create(supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(
        editingSupplier
          ? 'Supplier updated successfully!'
          : 'Supplier added successfully!'
      );
      setDialogOpen(false);
      setEditingSupplier(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        contactMethod: '',
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: (id) => supplierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setConfirmDelete({ open: false, id: null });
      toast.success(`Supplier deleted successfully!`);
    },
    onError: (error) => {
      setConfirmDelete({ open: false, id: null });
      toast.error(error.response.data.message);
    },
  });

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      contactMethod: supplier.contactMethod || '',
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      contactMethod: '',
    });
    setDialogOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = () => {
    saveSupplier.mutate(formData);
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search suppliers..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <SortControl
            sortBy={sortBy}
            order={order}
            onSortChange={(sb, o) => {
              setSortBy(sb);
              setOrder(o);
              setPage(1);
            }}
            options={[
              { value: 'createdAt', label: 'createdAt' },
              { value: 'name', label: 'Name' },
              { value: 'email', label: 'Email' },
            ]}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Supplier
        </Button>
      </div>

      {/* Supplier Rows - Tablet First */}
      <div className="space-y-3">
        {suppliers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground ">
              No suppliers found
            </CardContent>
          </Card>
        ) : (
          <Card className="divide-y gap-0">
            {suppliers.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <div
                  key={s.id}
                  className="overflow-hidden cursor-pointer hover:bg-muted px-2 mx-4 rounded-sm"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(s.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-8">#{s.id}</span>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-cyan-600 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(s);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete({ open: true, id: s.id });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Details */}
                  {isExpanded && (
                    <div className="bg-muted/30 px-4 py-3 space-y-2">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email: </span>
                          <span className="font-medium">{s.email || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <span className="font-medium">{s.phone || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Contact Method:{' '}
                          </span>
                          <span className="font-medium">
                            {s.contactMethod || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <PaginationControls
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => p + 1)}
          disabled={isFetching}
        />
      )}

      {/* Dialogs */}
      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSupplier={editingSupplier}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={saveSupplier.isPending}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Supplier"
        message="This action cannot be undone."
        onConfirm={() => deleteSupplier.mutate(confirmDelete.id)}
        isLoading={deleteSupplier.isPending}
      />
    </div>
  );
}
