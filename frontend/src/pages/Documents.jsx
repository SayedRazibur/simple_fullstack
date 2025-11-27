import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Plus, Send, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { documentApi } from '@/services/documents.service';
import { clientApi } from '@/services/clients.service';
import useDocuments from '@/hooks/useDocuments';
import useClients from '@/hooks/useClients';
import Loader from '@/components/common/Loader';
import DateFilter from '@/components/common/DateFilter';
import SearchInput from '@/components/common/SearchInput';
import FilePreview from '@/components/common/FilePreview';
import ErrorState from '@/components/common/ErrorState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PaginationControls from '@/components/common/PaginationControls';
import SortControl from '@/components/common/SortControl';
import { useAuthStore } from '@/store/authStore';

export default function DocumentScreen() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [sortBy, setSortBy] = useState('importedOn');
  const [order, setOrder] = useState('desc');
  const [expanded, setExpanded] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [newDocument, setNewDocument] = useState({
    title: '',
    files: [],
  });
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');

  // Fetch documents with pagination, search, sorting, and date filter
  const {
    data: documentsData,
    isLoading: documentsLoading,
    isFetching: documentsFetching,
    isError: documentsError,
    refetch: refetchDocuments,
  } = useDocuments({
    page,
    limit: 10,
    search,
    order,
    sortBy,
    date: selectedDate,
  });

  // Fetch clients for send document dialog
  const {
    data: clientsData,
    isLoading: clientsLoading,
    isError: clientsError,
  } = useClients({
    page: 1,
    limit: 100,
    search: clientSearch,
  });

  // Transform backend response
  const documents =
    documentsData?.data?.records?.map((doc) => ({
      ...doc,
      url: doc.links || [],
    })) || [];
  const pagination = documentsData?.data?.pagination;
  const clients = clientsData?.data?.records || [];

  // Filter clients based on search (client-side filtering for send dialog)
  const filteredClients = clients.filter(
    (client) =>
      `${client.firstName} ${client.surname || ''}`
        .toLowerCase()
        .includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.id.toString().includes(clientSearch)
  );

  // Mutations
  const addDocumentMutation = useMutation({
    mutationFn: (data) => documentApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsAddOpen(false);
      setIsAddOpen(false);
      setNewDocument({ title: '', files: [] });
      toast.success('Document added successfully!');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to add document. Please try again.'
      );
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => documentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setDeleteId(null);
      toast.success('Document deleted successfully!');
    },
    onError: (error) => {
      setDeleteId(null);
      toast.error(
        error.response?.data?.message || 'Failed to delete document.'
      );
    },
  });

  const sendDocumentMutation = useMutation({
    mutationFn: ({ documentId, clientIds }) =>
      documentApi.sendToClients({ documentId, clientIds }),
    onSuccess: (response) => {
      const data = response.data;
      setSelectedDocument(null);
      setSelectedClients([]);
      setClientSearch('');
      setIsSendOpen(false);

      if (data.failed > 0) {
        toast.warning(
          `Document sent to ${data.successful} client(s), but ${data.failed} failed.`
        );
      } else {
        toast.success(
          `Document sent successfully to ${data.successful} client(s)!`
        );
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send document.');
    },
  });

  // Check if all filtered clients are selected
  const allFilteredSelected =
    filteredClients.length > 0 &&
    filteredClients.every((client) => selectedClients.includes(client.id));

  // Toggle select all filtered clients
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedClients((prev) =>
        prev.filter((id) => !filteredClients.some((client) => client.id === id))
      );
    } else {
      const newSelected = new Set([...selectedClients]);
      filteredClients.forEach((client) => newSelected.add(client.id));
      setSelectedClients(Array.from(newSelected));
    }
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocument.title || newDocument.files.length === 0) {
      toast.warning('Please provide both title and at least one file');
      return;
    }
    addDocumentMutation.mutate(newDocument);
  };

  const handleSendDocument = (e) => {
    e.preventDefault();
    if (!selectedDocument || selectedClients.length === 0) return;
    sendDocumentMutation.mutate({
      documentId: selectedDocument.id,
      clientIds: selectedClients,
    });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    deleteDocumentMutation.mutate(deleteId);
  };

  const handleClientSelection = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const openSendDialog = (document) => {
    setSelectedDocument(document);
    setSelectedClients([]);
    setClientSearch('');
    setIsSendOpen(true);
  };

  // Loading state
  if (documentsLoading || clientsLoading) {
    return <Loader />;
  }

  // Error state
  if (documentsError || clientsError) {
    return <ErrorState onRetry={refetchDocuments} />;
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchInput
            placeholder="Search documents..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <DateFilter
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date);
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
              { value: 'importedOn', label: 'Imported Date' },
              { value: 'title', label: 'Title' },
            ]}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Add Document Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDocument} className="space-y-3">
            <Input
              placeholder="Title"
              required
              value={newDocument.title}
              onChange={(e) =>
                setNewDocument((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={addDocumentMutation.isPending}
            />
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.docx,.csv,.xlsx,.mp4"
              onChange={(e) =>
                setNewDocument((prev) => ({
                  ...prev,
                  files: Array.from(e.target.files || []),
                }))
              }
              disabled={addDocumentMutation.isPending}
              required
            />
            {newDocument.files.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p>Selected {newDocument.files.length} file(s):</p>
                <ul className="list-disc list-inside">
                  {newDocument.files.map((f, i) => (
                    <li key={i} className="truncate">
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={addDocumentMutation.isPending}>
                {addDocumentMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteDocumentMutation.isPending}
        variant="destructive"
        title="Delete Document"
        message="This action cannot be undone."
      />

      {/* Send Document Dialog */}
      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendDocument} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected Document
              </label>
              <div className="p-3 border rounded bg-muted">
                <strong>{selectedDocument?.title}</strong>
                <div className="text-sm text-muted-foreground mt-1">
                  ID: {selectedDocument?.id} | Imported:{' '}
                  {selectedDocument?.importedOn}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-medium text-sm">
                  Select Clients ({selectedClients.length} selected)
                </label>
                {filteredClients.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="h-8 text-xs"
                    disabled={sendDocumentMutation.isPending}
                  >
                    <Check
                      className={`w-3 h-3 mr-1 ${
                        allFilteredSelected ? 'opacity-100' : 'opacity-50'
                      }`}
                    />
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              <SearchInput
                placeholder="Search clients by name, email, or ID..."
                value={clientSearch}
                onChange={setClientSearch}
                disabled={sendDocumentMutation.isPending}
              />

              <div className="border mt-3 rounded p-3 max-h-64 overflow-y-auto space-y-2">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        selectedClients.includes(client.id)
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted'
                      } ${
                        sendDocumentMutation.isPending
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() =>
                        !sendDocumentMutation.isPending &&
                        handleClientSelection(client.id)
                      }
                    >
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center ${
                          selectedClients.includes(client.id)
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedClients.includes(client.id) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {client.firstName} {client.surname || ''}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {client.id} | {client.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No clients found
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  selectedClients.length === 0 || sendDocumentMutation.isPending
                }
                className="min-w-24"
              >
                {sendDocumentMutation.isPending
                  ? 'Sending...'
                  : `Send to ${selectedClients.length} client${
                      selectedClients.length !== 1 ? 's' : ''
                    }`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents ({pagination?.total_records || documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found
            </div>
          ) : (
            documents.map((doc) => {
              const isOpen = expanded === doc.id;
              return (
                <div key={doc.id} className="py-3">
                  <div
                    className="flex items-center justify-between cursor-pointer hover:bg-muted rounded-md p-2"
                    onClick={() => setExpanded(isOpen ? null : doc.id)}
                  >
                    <div className="flex gap-6 items-center">
                      <span className="font-medium w-8">#{doc.id}</span>
                      <span className="flex-1">{doc.title}</span>
                      <span className="text-sm text-muted-foreground min-w-24">
                        {doc.importedOn
                          ? new Date(doc.importedOn).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>

                  {isOpen && (
                    <div className="mt-3 p-3 bg-muted/40 rounded-lg relative">
                      {/* Top corner buttons */}
                      <div className="absolute right-3 top-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSendDialog(doc);
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send
                        </Button>

                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>

                      {/* Content preview */}
                      <div className="mt-10">
                        {doc.url && doc.url.length > 0 ? (
                          doc.url.map((url, index) => (
                            <div key={index} className="mb-4">
                              <FilePreview url={url} title={doc.title} />
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">
                            No files available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && (
        <PaginationControls
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => p + 1)}
          disabled={documentsFetching}
        />
      )}
    </div>
  );
}
