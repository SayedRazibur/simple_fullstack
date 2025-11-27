// src/components/products/ProductFormDialog.jsx
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Trash2, CalendarIcon, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSuppliers from '@/hooks/useSuppliers';
import useReferenceData from '@/hooks/useReferenceData';
import useDocuments from '@/hooks/useDocuments';
import { toast } from 'sonner';

export default function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  formData,
  setFormData,
  onSubmit,
  isLoading,
  onFileUpload,
  isUploading,
}) {
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');

  // Fetch suppliers, units, and documents
  const { data: suppliersData } = useSuppliers({
    page: 1,
    limit: 50,
    search: supplierSearch,
  });
  const { data: units } = useReferenceData('units', unitSearch);
  const { data: departments } = useReferenceData(
    'departments',
    departmentSearch
  );
  const { data: documentsData } = useDocuments({
    page: 1,
    limit: 50,
    search: docSearch,
  });

  const suppliers = suppliersData?.data?.records || [];
  const documents = documentsData?.data?.records || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
      toast.error('Department is required');
      return;
    }
    onSubmit();
  };

  // ==================== BATCH MANAGEMENT ====================
  const handleAddBatch = () => {
    setFormData({
      ...formData,
      batches: [
        ...formData.batches,
        {
          quantity: '',
          dlc: new Date(),
          deliveryTemp: '',
          supplierId: '',
          unitId: '',
        },
      ],
    });
  };

  const handleBatchChange = (index, field, value) => {
    const updatedBatches = [...formData.batches];
    updatedBatches[index] = {
      ...updatedBatches[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      batches: updatedBatches,
    });
  };

  const handleRemoveBatch = (index) => {
    setFormData({
      ...formData,
      batches: formData.batches.filter((_, i) => i !== index),
    });
  };

  // ==================== DOCUMENT MANAGEMENT ====================
  const toggleDocument = (doc) => {
    setFormData((prev) => {
      const exists = prev.documents.find((d) => d.id === doc.id);
      if (exists) {
        return {
          ...prev,
          documents: prev.documents.filter((d) => d.id !== doc.id),
        };
      }
      return { ...prev, documents: [...prev.documents, doc] };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            {/* Basic Product Info */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Product Type"
                value={formData.productType}
                onChange={(e) =>
                  setFormData({ ...formData, productType: e.target.value })
                }
                required
              />
            </div>

            {/* Department Dropdown */}
            <div className="space-y-2">
              <Label>
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.departmentId?.toString() || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, departmentId: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5">
                    <Input
                      placeholder="Search departments..."
                      value={departmentSearch}
                      onChange={(e) => setDepartmentSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {departments &&
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Critical Quantity and PLU */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Critical Quantity"
                type="number"
                step="0.01"
                value={formData.criticalQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, criticalQuantity: e.target.value })
                }
                required
              />
              <Input
                placeholder="PLU"
                type="number"
                value={formData.plu}
                onChange={(e) =>
                  setFormData({ ...formData, plu: e.target.value })
                }
                required
              />
            </div>

            {/* ==================== BATCHES SECTION ==================== */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Batches</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBatch}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Batch
                </Button>
              </div>

              {formData.batches.length > 0 && (
                <div className="space-y-3 bg-muted/30 p-3 rounded-md">
                  {formData.batches.map((batch, index) => (
                    <div
                      key={index}
                      className="bg-background p-3 rounded border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Batch #{index + 1}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-8"
                          onClick={() => handleRemoveBatch(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Quantity */}
                        <Input
                          placeholder="Quantity"
                          type="number"
                          step="0.01"
                          value={batch.quantity}
                          onChange={(e) =>
                            handleBatchChange(index, 'quantity', e.target.value)
                          }
                          required
                        />

                        {/* Delivery Temp */}
                        <Input
                          placeholder="Delivery Temp (°C)"
                          type="number"
                          step="0.1"
                          value={batch.deliveryTemp}
                          onChange={(e) =>
                            handleBatchChange(
                              index,
                              'deliveryTemp',
                              e.target.value
                            )
                          }
                          required
                        />

                        {/* DLC Date */}
                        <div className="col-span-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {batch.dlc
                                  ? format(new Date(batch.dlc), 'PPP')
                                  : 'Pick DLC date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="w-auto p-0"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  batch.dlc ? new Date(batch.dlc) : undefined
                                }
                                onSelect={(date) =>
                                  handleBatchChange(index, 'dlc', date)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Supplier Dropdown */}
                        <div className="col-span-2">
                          <Select
                            value={batch.supplierId?.toString() || ''}
                            onValueChange={(value) =>
                              handleBatchChange(
                                index,
                                'supplierId',
                                parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-1.5">
                                <Input
                                  placeholder="Search suppliers..."
                                  value={supplierSearch}
                                  onChange={(e) =>
                                    setSupplierSearch(e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              {suppliers.map((supplier) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id.toString()}
                                >
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Unit Dropdown */}
                        <div className="col-span-2">
                          <Select
                            value={batch.unitId?.toString() || ''}
                            onValueChange={(value) =>
                              handleBatchChange(
                                index,
                                'unitId',
                                parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-1.5">
                                <Input
                                  placeholder="Search units..."
                                  value={unitSearch}
                                  onChange={(e) =>
                                    setUnitSearch(e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              {units &&
                                units.map((unit) => (
                                  <SelectItem
                                    key={unit.id}
                                    value={unit.id.toString()}
                                  >
                                    {unit.unitType}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ==================== DOCUMENTS SECTION ==================== */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Documents</Label>
                <label>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </span>
                  </Button>
                </label>
              </div>

              <Input
                placeholder="Search documents..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />

              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50',
                      formData.documents.find((d) => d.id === doc.id) &&
                        'bg-primary/10'
                    )}
                    onClick={() => toggleDocument(doc)}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm flex-1">{doc.title}</span>
                  </div>
                ))}
              </div>

              {formData.documents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.documents.map((doc) => (
                    <Badge
                      key={doc.id}
                      variant="secondary"
                      className="flex items-center gap-1 max-w-[200px]"
                    >
                      <span className="truncate" title={doc.title}>
                        {doc.title}
                      </span>
                      <span>
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer shrink-0"
                          onClick={() => toggleDocument(doc)}
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingProduct ? 'Update' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
