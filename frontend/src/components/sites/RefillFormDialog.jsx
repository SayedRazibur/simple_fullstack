import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SearchInput from '@/components/common/SearchInput';
import ProductSelect from '@/components/common/ProductSelect';
import SiteSelect from '@/components/common/SiteSelect';
import { Plus, Minus } from 'lucide-react';

export default function RefillFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) {
  const handleAddRefill = () => {
    setFormData({
      ...formData,
      refills: [...formData.refills, { productId: '', quantity: 1 }],
    });
  };

  const handleRemoveRefill = (index) => {
    setFormData({
      ...formData,
      refills: formData.refills.filter((_, i) => i !== index),
    });
  };

  const handleRefillChange = (index, field, value) => {
    const updatedRefills = [...formData.refills];
    updatedRefills[index] = { ...updatedRefills[index], [field]: value };
    setFormData({ ...formData, refills: updatedRefills });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Refill</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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

          {/* Refills List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Products *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddRefill}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {formData.refills.map((refill, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <ProductSelect
                      value={
                        refill.productId ? refill.productId.toString() : ''
                      }
                      onValueChange={(value) =>
                        handleRefillChange(index, 'productId', parseInt(value))
                      }
                      onSelect={(product) => {
                        const unit = product.batches?.[0]?.unit?.unitType || '';
                        handleRefillChange(index, 'unit', unit);
                      }}
                    />
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={refill.quantity}
                      onChange={(e) =>
                        handleRefillChange(
                          index,
                          'quantity',
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    {refill.unit && (
                      <span
                        className="text-xs text-muted-foreground w-12 truncate"
                        title={refill.unit}
                      >
                        {refill.unit}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleRemoveRefill(index)}
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
                isLoading || !formData.siteId || formData.refills.length === 0
              }
            >
              {isLoading ? 'Creating...' : 'Create Refill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
