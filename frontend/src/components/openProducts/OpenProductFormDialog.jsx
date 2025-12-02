import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ProductSelect from '@/components/common/ProductSelect';
import SiteSelect from '@/components/common/SiteSelect';
import DocumentSelect from '@/components/common/DocumentSelect';
import { Plus, Minus, Upload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OpenProductFormDialog({
  open,
  onOpenChange,
  editingRecord,
  formData,
  setFormData,
  onFileUpload,
  onSubmit,
  isLoading,
  isUploading,
  uploadedDocument,
}) {
  // Sync uploadedDocument to formData when it changes
  useEffect(() => {
    if (uploadedDocument?.id) {
      setFormData((prev) => ({
        ...prev,
        documentId: uploadedDocument.id,
      }));
    }
  }, [uploadedDocument, setFormData]);

  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { productId: '' }],
    });
  };

  const handleRemoveProduct = (index) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    });
  };

  const handleProductChange = (index, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { productId: parseInt(value) };
    setFormData({ ...formData, products: updatedProducts });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingRecord ? 'Edit Open Product' : 'Add Open Product'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={onSubmit} className="space-y-4 pr-4">
            {/* Site Selection */}
            <div className="space-y-2">
              <Label htmlFor="site">Site *</Label>
              <SiteSelect
                value={formData.siteId ? formData.siteId.toString() : ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, siteId: parseInt(value) })
                }
                allowAll={false}
              />
            </div>

            {/* Document Selection/Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="document">Document *</Label>
                <label>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onFileUpload}
                    disabled={isUploading}
                    accept=".pdf,.jpg,.png,.docx,.csv,.xlsx,.mp4"
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
                      {isUploading ? 'Uploading...' : 'Upload New'}
                    </span>
                  </Button>
                </label>
              </div>

              <DocumentSelect
                value={
                  formData.documentId ? formData.documentId.toString() : ''
                }
                onValueChange={(value) =>
                  setFormData({ ...formData, documentId: parseInt(value) })
                }
                allowAll={false}
                uploadedDocument={uploadedDocument}
              />
            </div>

            {/* Products List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddProduct}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Product
                </Button>
              </div>

              <div className="space-y-3">
                {formData.products.map((product, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <ProductSelect
                        value={
                          product.productId ? product.productId.toString() : ''
                        }
                        onValueChange={(value) =>
                          handleProductChange(index, value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRemoveProduct(index)}
                      disabled={formData.products.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.siteId ||
                  !formData.documentId ||
                  formData.products.length === 0
                }
              >
                {isLoading
                  ? editingRecord
                    ? 'Updating...'
                    : 'Creating...'
                  : editingRecord
                  ? 'Update Open Product'
                  : 'Create Open Product'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
