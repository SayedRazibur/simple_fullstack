import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import DaySelect from '@/components/common/DaySelect';
import PickupSelect from '@/components/common/PickupSelect';
import SupplierSelect from '@/components/common/SupplierSelect';
import ProductSelect from '@/components/common/ProductSelect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PurchaseFormDialog({
  open,
  onOpenChange,
  editingPurchase,
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleDayChange = (val) => {
    setFormData({
      ...formData,
      day: val === 'ALL' || val === 'NONE' || !val ? null : val,
      date: val && val !== 'ALL' && val !== 'NONE' ? '' : formData.date,
    });
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setFormData({
      ...formData,
      date: dateValue,
      day: dateValue ? null : formData.day,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: null, quantity: 1 }],
    });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingPurchase ? 'Edit Purchase' : 'Add Purchase'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Recurrence Day</Label>
                <DaySelect
                  value={formData.day || ''}
                  onValueChange={handleDayChange}
                  allowAll={false}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select for weekly recurrence
                </p>
              </div>

              <div>
                <Label>Specific Date</Label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={handleDateChange}
                  disabled={!!formData.day}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set specific date (clears recurrence)
                </p>
              </div>

              <div>
                <Label>Pickup *</Label>
                <PickupSelect
                  value={formData.pickupId?.toString() || ''}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      pickupId: val === 'ALL' || !val ? null : parseInt(val),
                    })
                  }
                  allowAll={false}
                />
              </div>

              <div>
                <Label>Supplier *</Label>
                <SupplierSelect
                  value={formData.supplierId?.toString() || ''}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      supplierId: val === 'ALL' || !val ? null : parseInt(val),
                    })
                  }
                  allowAll={false}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 border rounded-md border-dashed text-muted-foreground">
                  No items added. Click "Add Item" to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <Card key={index} className="bg-muted/20">
                      <CardContent className="p-3 flex items-end gap-3">
                        <div className="flex-1">
                          <Label className="text-xs mb-1.5 block">
                            Product *
                          </Label>
                          <ProductSelect
                            value={item.productId?.toString() || ''}
                            onValueChange={(val) =>
                              updateItem(
                                index,
                                'productId',
                                val ? parseInt(val) : null
                              )
                            }
                            allowAll={false}
                            supplierId={formData.supplierId}
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs mb-1.5 block">
                            Quantity *
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, 'quantity', e.target.value)
                            }
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive shrink-0"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.pickupId ||
                  !formData.supplierId ||
                  formData.items.length === 0
                }
              >
                {isLoading ? 'Saving...' : editingPurchase ? 'Update' : 'Save'}
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
