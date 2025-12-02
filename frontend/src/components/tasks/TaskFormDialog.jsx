// src/components/tasks/TaskFormDialog.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import EntitySelect from '@/components/common/EntitySelect';
import DaySelect from '@/components/common/DaySelect';
import ProductSelect from '@/components/common/ProductSelect';
import DocumentSelect from '@/components/common/DocumentSelect';
import OrderSelect from '@/components/common/OrderSelect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/services/documents.service';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

export default function TaskFormDialog({
  open,
  onOpenChange,
  editingTask,
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', file: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  // Handle day change - clear date if day is selected
  const handleDayChange = (val) => {
    setFormData({
      ...formData,
      day: val === 'ALL' || !val ? null : val,
      date: val && val !== 'ALL' ? '' : formData.date, // Clear date when day is selected
    });
  };

  // Handle date change - clear day if date is selected
  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setFormData({
      ...formData,
      date: dateValue,
      day: dateValue ? null : formData.day, // Clear day when date is selected
    });
  };

  const uploadDocumentMutation = useMutation({
    mutationFn: (data) => documentApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');

      // Auto-select the new document
      if (response.data) {
        setFormData({
          ...formData,
          documentId: response.data.id,
        });
      }

      // Reset upload state
      setShowUpload(false);
      setNewDoc({ title: '', file: null });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to upload document.'
      );
    },
  });

  const handleUpload = async () => {
    if (!newDoc.title || !newDoc.file) {
      toast.warning('Please provide both title and file');
      return;
    }

    uploadDocumentMutation.mutate({
      title: newDoc.title,
      files: [newDoc.file],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="Task title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Recurrence Day</Label>
              <DaySelect
                value={formData.day || ''}
                onValueChange={handleDayChange}
                allowAll={false}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Select a day for weekly recurrence (e.g., every Monday)
              </p>
            </div>

            <div>
              <Label>Specific Date</Label>
              <Input
                type="date"
                value={formData.date || ''}
                onChange={handleDateChange}
                disabled={!!formData.day} // Disable if day is selected
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.day
                  ? 'Clear recurrence day to set a specific date'
                  : 'Set a specific date for this task'}
              </p>
            </div>

            <div>
              <Label>Entity</Label>
              <EntitySelect
                value={formData.entityId?.toString() || ''}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    entityId: val === 'ALL' || !val ? null : parseInt(val),
                  })
                }
                allowAll={false}
              />
            </div>

            <div>
              <Label>Product</Label>
              <ProductSelect
                value={formData.productId?.toString() || ''}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    productId: val === 'ALL' || !val ? null : parseInt(val),
                  })
                }
                allowAll={false}
              />
            </div>

            <div>
              <Label>Order</Label>
              <OrderSelect
                value={formData.orderId?.toString() || ''}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    orderId: val === 'ALL' || !val ? null : parseInt(val),
                  })
                }
                allowAll={false}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Document</Label>
                {!showUpload && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary"
                    onClick={() => setShowUpload(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> New Document
                  </Button>
                )}
              </div>

              {showUpload ? (
                <div className="p-3 border rounded-md bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Upload New Document
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowUpload(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Document Title"
                      value={newDoc.title}
                      onChange={(e) =>
                        setNewDoc({ ...newDoc, title: e.target.value })
                      }
                      className="bg-background"
                    />
                    <Input
                      type="file"
                      onChange={(e) =>
                        setNewDoc({
                          ...newDoc,
                          file: e.target.files?.[0] || null,
                        })
                      }
                      className="bg-background"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={handleUpload}
                      disabled={uploadDocumentMutation.isPending}
                    >
                      {uploadDocumentMutation.isPending
                        ? 'Uploading...'
                        : 'Upload & Select'}
                    </Button>
                  </div>
                </div>
              ) : (
                <DocumentSelect
                  value={formData.documentId?.toString() || ''}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      documentId: val === 'ALL' || !val ? null : parseInt(val),
                    })
                  }
                  allowAll={false}
                />
              )}
            </div>

            <div>
              <Label>Comment</Label>
              <Textarea
                placeholder="Task comment..."
                value={formData.comment || ''}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading || uploadDocumentMutation.isPending}
              >
                {isLoading ? 'Saving...' : editingTask ? 'Update' : 'Save'}
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
