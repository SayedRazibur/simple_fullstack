// src/pages/Products.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useProducts, {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useProducts';
import useSuppliers from '@/hooks/useSuppliers';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import PaginationControls from '@/components/common/PaginationControls';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SortControl from '@/components/common/SortControl';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { documentApi } from '@/services/documents.service';
import { format } from 'date-fns';
import FilePreview from '@/components/common/FilePreview';

export default function Products() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    productType: '',
    departmentId: '',
    criticalQuantity: '',
    plu: '',
    batches: [],
    documents: [],
  });

  const { data, isLoading, isFetching, isError, refetch } = useProducts({
    page,
    limit: 10,
    search,
    order,
    sortBy,
    supplierId,
  });

  // Fetch suppliers for filter dropdown
  const { data: suppliersData } = useSuppliers({
    page: 1,
    limit: 100,
    search: '',
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = data?.data?.records || [];
  const pagination = data?.data?.pagination;
  const suppliers = suppliersData?.data?.records || [];

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      productType: product.productType,
      departmentId: product.department?.id || '',
      criticalQuantity: product.criticalQuantity.toString(),
      plu: product.plu.toString(),
      batches: product.batches || [],
      documents: product.document || [],
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      productType: '',
      departmentId: '',
      criticalQuantity: '',
      plu: '',
      batches: [],
      documents: [],
    });
    setDialogOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = () => {
    // Format batches for API
    const formattedBatches = formData.batches.map((batch) => ({
      id: batch.id || undefined, // Include ID if editing existing batch
      quantity: parseFloat(batch.quantity),
      dlc: new Date(batch.dlc).toISOString(),
      deliveryTemp: parseFloat(batch.deliveryTemp),
      unitId: parseInt(batch.unitId),
      supplierId: parseInt(batch.supplierId),
    }));

    const payload = {
      name: formData.name,
      productType: formData.productType,
      departmentId: formData.departmentId,
      criticalQuantity: parseFloat(formData.criticalQuantity),
      plu: parseInt(formData.plu),
      batches: formattedBatches,
      documentIds: formData.documents.map((doc) => doc.id),
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingProduct(null);
          },
        }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (id) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        setConfirmDelete({ open: false, id: null });
      },
    });
  };

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (data) => documentApi.create(data),
    onSuccess: (response) => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      // Add uploaded document to form
      if (response.data) {
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, response.data],
        }));
      }
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to upload document.'
      );
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      await uploadDocumentMutation.mutateAsync({
        title: file.name,
        files: [file],
      });
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Search by id, plu, or name..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          {/* Supplier Filter */}
          <Select
            value={supplierId || 'ALL'}
            onValueChange={(value) => {
              setSupplierId(value === 'ALL' ? '' : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SortControl
            sortBy={sortBy}
            order={order}
            onSortChange={(sb, o) => {
              setSortBy(sb);
              setOrder(o);
              setPage(1);
            }}
            options={[
              { value: 'createdAt', label: 'Created At' },
              { value: 'name', label: 'Name' },
              { value: 'productType', label: 'Product Type' },
              { value: 'restock', label: 'Restock' },
            ]}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {/* Product Rows */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No products found
            </CardContent>
          </Card>
        ) : (
          <Card className="divide-y gap-0">
            {products.map((p) => {
              const isExpanded = expandedId === p.id;
              return (
                <div
                  key={p.id}
                  className="overflow-hidden cursor-pointer hover:bg-muted px-2 mx-4 rounded-sm"
                >
                  {/* Main Row */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(p.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-8">#{p.id}</span>
                        <span className="font-semibold">{p.name}</span>
                        <Badge variant="outline" className="text-xs">
                          PLU: {p.plu}
                        </Badge>
                        {p.restock && (
                          <Badge variant="destructive" className="text-xs">
                            Restock
                          </Badge>
                        )}
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
                              handleEdit(p);
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
                              setConfirmDelete({ open: true, id: p.id });
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
                    <div className="bg-muted/30 px-4 py-4 space-y-4">
                      {/* Basic Product Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Product Type:{' '}
                          </span>
                          <span className="font-medium">{p.productType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Critical Quantity:{' '}
                          </span>
                          <span className="font-medium">
                            {p.criticalQuantity}
                          </span>
                        </div>
                        <div className="col-span-full">
                          <span className="text-muted-foreground">
                            Department:{' '}
                          </span>
                          <div className="inline-flex gap-1 flex-wrap">
                            {p.department ? (
                              <Badge variant="secondary" className="text-xs">
                                {p.department.name}
                              </Badge>
                            ) : (
                              <span className="font-medium">—</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Batches Section */}
                      {p.batches && p.batches.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Batches</h4>
                          <div className="overflow-x-auto border rounded-md">
                            <table className="w-full text-xs">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-2 font-medium">
                                    Quantity
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    DLC
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Delivery Temp
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Supplier
                                  </th>
                                  <th className="text-left p-2 font-medium">
                                    Unit
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.batches.map((batch, idx) => (
                                  <tr
                                    key={batch.id || idx}
                                    className="border-t hover:bg-muted/30"
                                  >
                                    <td className="p-2">{batch.quantity}</td>
                                    <td className="p-2">
                                      {format(new Date(batch.dlc), 'PP')}
                                    </td>
                                    <td className="p-2">
                                      {batch.deliveryTemp}°C
                                    </td>
                                    <td className="p-2">
                                      {batch.supplier?.name || '—'}
                                    </td>
                                    <td className="p-2">
                                      {batch.unit?.unitType || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {p.document && p.document.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Documents</h4>
                          <div className="space-y-2">
                            {p.document.map((doc) => (
                              <div key={doc.id} className="space-y-2">
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <FileText className="w-3 h-3" />
                                  {doc.title}
                                </Badge>
                                {doc.links && doc.links.length > 0 ? (
                                  doc.links.map((link, idx) => (
                                    <FilePreview
                                      key={idx}
                                      url={link}
                                      title={doc.title}
                                    />
                                  ))
                                ) : (
                                  <p className="text-xs text-muted-foreground pl-2">
                                    No preview available
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending || updateProduct.isPending}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Product"
        message="This action cannot be undone."
        onConfirm={() => handleDelete(confirmDelete.id)}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
