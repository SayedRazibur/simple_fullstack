import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useOpenProducts from '@/hooks/useOpenProducts';
import OpenProductFormDialog from '@/components/openProducts/OpenProductFormDialog';
import DocumentViewDialog from '@/components/openProducts/DocumentViewDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import SiteSelect from '@/components/common/SiteSelect';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { openProductApi } from '@/services/openProducts.service';
import { documentApi } from '@/services/documents.service';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OpenProducts() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  // UI State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Filters
  const [siteFilter, setSiteFilter] = useState('ALL');
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState(today);

  // Form state
  const [formData, setFormData] = useState({
    siteId: null,
    documentId: null,
    products: [{ productId: '' }],
  });

  // Fetch filtered open products
  const { data, isLoading, isError, refetch } = useOpenProducts({
    siteId: siteFilter === 'ALL' ? null : parseInt(siteFilter),
    date: dateFilter,
  });

  // FIXED: Correct data path is data.data.data.records (axios wraps response in data)
  const openProducts = data?.data?.data?.records || [];

  // Group open products by site and date
  const groupedOpenProducts = useMemo(() => {
    const groups = {};

    openProducts.forEach((record) => {
      const date = record.createdAt.split('T')[0]; // Get date part only
      const siteId = record.siteId;
      const siteName = record.site.siteName;
      const key = `${siteId}_${date}`;

      if (!groups[key]) {
        groups[key] = {
          siteId,
          siteName,
          date,
          records: [],
        };
      }

      groups[key].records.push(record);
    });

    // Convert to array and sort
    return Object.values(groups).sort((a, b) => {
      // Sort by date (newest first) then by site name
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.siteName.localeCompare(b.siteName);
    });
  }, [openProducts]);

  // Mutations
  const saveOpenProduct = useMutation({
    mutationFn: (openProduct) =>
      editingRecord
        ? openProductApi.update(editingRecord.id, openProduct)
        : openProductApi.create(openProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openProducts'] });
      toast.success(
        editingRecord ? 'Open product updated!' : 'Open product created!'
      );
      setDialogOpen(false);
      setEditingRecord(null);
      setFormData({
        siteId: null,
        documentId: null,
        products: [{ productId: '' }],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const deleteOpenProduct = useMutation({
    mutationFn: (id) => openProductApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openProducts'] });
      setConfirmDelete({ open: false, id: null });
      toast.success('Open product deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (data) => documentApi.create(data),
    onSuccess: (response) => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });

      // Handle response structure (response.data or direct response)
      const docData = response.data || response;

      if (docData && docData.id) {
        setUploadedDocument(docData);
        setFormData((prev) => ({
          ...prev,
          documentId: docData.id,
        }));
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to upload document.'
      );
    },
  });

  // Handlers
  const handleAdd = () => {
    setEditingRecord(null);
    setUploadedDocument(null); // Reset uploaded document
    setFormData({
      siteId: null,
      documentId: null,
      products: [{ productId: '' }],
    });
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setUploadedDocument(null); // Reset uploaded document
    setFormData({
      siteId: record.siteId,
      documentId: record.documentId,
      products: record.products.map((p) => ({ productId: p.productId })),
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveOpenProduct.mutate(formData);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Upload all files with open_product + UTC timestamp as title
    const timestamp = Date.now();
    await uploadDocumentMutation.mutateAsync({
      title: `open_product_${timestamp}`,
      files: files,
    });
  };

  const toggleGroupExpand = (key) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="p-6 space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-[200px]">
            <SiteSelect
              value={siteFilter}
              onValueChange={setSiteFilter}
              allowAll={true}
            />
          </div>
          <div className="w-[200px] space-y-1">
            <Label htmlFor="dateFilter" className="text-xs">
              From Date
            </Label>
            <Input
              id="dateFilter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Open Product
          </Button>
        </div>
      </div>

      {/* Grouped Open Products List */}
      <Card className="bg-muted/20">
        <CardContent className="p-6 space-y-4">
          {groupedOpenProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No open products found. Try adjusting your filters.
            </p>
          ) : (
            groupedOpenProducts.map((group) => {
              const groupKey = `${group.siteId}_${group.date}`;
              const isExpanded = expandedGroups.has(groupKey);
              const totalProducts = group.records.reduce(
                (sum, r) => sum + r.products.length,
                0
              );

              return (
                <div
                  key={groupKey}
                  className="rounded-md border border-border/40 bg-background/80 shadow-sm"
                >
                  {/* Group Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors bg-muted/30"
                    onClick={() => toggleGroupExpand(groupKey)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-lg">
                          {group.siteName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-sm font-semibold"
                        >
                          {formatDate(group.date)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {group.records.length} Records
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {totalProducts} Total Products
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </div>
                  </div>

                  {/* Group Content - Individual Records */}
                  {isExpanded && (
                    <div className="border-t bg-background px-4 py-4 space-y-2">
                      {group.records.map((record) => (
                        <div
                          key={record.id}
                          className="rounded border bg-muted/10 p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium">
                                  #{record.id}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {formatDateTime(record.createdAt)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {record.products.length} Products
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {record.products.map((item) => (
                                  <div
                                    key={item.id}
                                    className="text-sm text-muted-foreground ml-4"
                                  >
                                    • {item.product.name} (PLU:{' '}
                                    {item.product.plu})
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {record.document && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewDocument(record.document);
                                  }}
                                  title="View Document"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              )}
                              {isAdmin && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-cyan-600"
                                    onClick={() => handleEdit(record)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => {
                                      setConfirmDelete({
                                        open: true,
                                        id: record.id,
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <OpenProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRecord={editingRecord}
        formData={formData}
        setFormData={setFormData}
        onFileUpload={handleFileUpload}
        onSubmit={handleSubmit}
        isLoading={saveOpenProduct.isPending}
        isUploading={uploadDocumentMutation.isPending}
        uploadedDocument={uploadedDocument}
      />

      <DocumentViewDialog
        open={!!viewDocument}
        onClose={() => setViewDocument(null)}
        document={viewDocument}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Open Product"
        message="This action cannot be undone."
        onConfirm={() => deleteOpenProduct.mutate(confirmDelete.id)}
        isLoading={deleteOpenProduct.isPending}
      />
    </div>
  );
}
