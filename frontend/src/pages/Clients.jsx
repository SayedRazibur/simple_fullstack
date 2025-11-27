// src/pages/clients/Clients.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useClients from '@/hooks/useClients';
import ClientFormDialog from '@/components/clients/ClientFormDialog';
import PaginationControls from '@/components/common/PaginationControls';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clientApi } from '@/services/clients.service';
import SortControl from '@/components/common/SortControl';
import { toast } from 'sonner';

export default function Clients() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('asc');

  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    address: '',
    email: '',
    phone: '',
  });

  const { data, isLoading, isFetching, isError, refetch } = useClients({
    page,
    limit: 10,
    search,
    order, // 'asc', 'desc'
    sortBy, // 'firstName', 'surname', 'email', 'createdAt'
  });

  const clients = data?.data?.records || [];
  const pagination = data?.data?.pagination;

  const saveClient = useMutation({
    mutationFn: (client) =>
      editingClient
        ? clientApi.update(editingClient.id, client)
        : clientApi.create(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(
        editingClient
          ? 'Client updated successfully!'
          : 'Client added successfully!'
      );
      setDialogOpen(false);
      setEditingClient(null);
      setFormData({
        firstName: '',
        surname: '',
        address: '',
        email: '',
        phone: '',
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const deleteClient = useMutation({
    mutationFn: (id) => clientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setConfirmDelete({ open: false, id: null });
      toast.success(`Client deleted successfully!`);
    },
    onError: (error) => {
      setConfirmDelete({ open: false, id: null });
      toast.error(error.response.data.message);
    },
  });

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      surname: client.surname || '',
      address: client.address || '',
      email: client.email,
      phone: client.phone,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      firstName: '',
      surname: '',
      address: '',
      email: '',
      phone: '',
    });
    setDialogOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = () => {
    saveClient.mutate(formData);
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search clients..."
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
              { value: 'firstName', label: 'First Name' },
              { value: 'surname', label: 'Surname' },
              { value: 'email', label: 'Email' },
            ]}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Client
        </Button>
      </div>

      {/* Client Rows - Tablet First */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground ">
              No clients found
            </CardContent>
          </Card>
        ) : (
          <Card className="divide-y gap-0">
            {clients.map((c) => {
              const isExpanded = expandedId === c.id;
              return (
                <div
                  key={c.id}
                  className="overflow-hidden cursor-pointer hover:bg-muted px-2 mx-4 rounded-sm"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(c.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-8">#{c.id}</span>
                        <span className="font-semibold">
                          {c.firstName} {c.surname || ''}
                        </span>
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
                              handleEdit(c);
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
                              setConfirmDelete({ open: true, id: c.id });
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
                          <span className="font-medium">{c.email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <span className="font-medium">{c.phone}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Address:{' '}
                          </span>
                          <span className="font-medium">
                            {c.address || '—'}
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
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingClient={editingClient}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={saveClient.isPending}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Client"
        message="This action cannot be undone."
        onConfirm={() => deleteClient.mutate(confirmDelete.id)}
        isLoading={deleteClient.isPending}
      />
    </div>
  );
}
