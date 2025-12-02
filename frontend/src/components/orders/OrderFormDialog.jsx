// src/components/orders/OrderFormDialog.jsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2 } from 'lucide-react';
import useClients from '@/hooks/useClients';
import useProducts from '@/hooks/useProducts';
import useReferenceData from '@/hooks/useReferenceData';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OrderFormDialog({
  open,
  onOpenChange,
  editingOrder,
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) {
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Fetch dropdown data
  const { data: clientsData } = useClients({
    page: 1,
    limit: 50,
    search: clientSearch,
  });
  const { data: productsData } = useProducts({
    page: 1,
    limit: 50,
    search: productSearch,
  });
  const { data: orderTypes } = useReferenceData('order-types');
  const { data: services } = useReferenceData('services');
  const { data: pickups } = useReferenceData('pickups');

  const clients = clientsData?.data?.records || [];
  const products = productsData?.data?.records || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '' }],
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const toggleService = (serviceId) => {
    const services = formData.services || [];
    if (services.includes(serviceId)) {
      setFormData({
        ...formData,
        services: services.filter((id) => id !== serviceId),
      });
    } else {
      setFormData({
        ...formData,
        services: [...services, serviceId],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingOrder ? 'Edit Order' : 'Create Order'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection with Search */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={formData.clientId?.toString() || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: parseInt(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5">
                    <Input
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.firstName} {client.surname || ''} -{' '}
                      {client.email || client.phone || `ID: ${client.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Type Selection */}
            <div className="space-y-2">
              <Label>Order Type *</Label>
              <Select
                value={formData.orderTypeId?.toString() || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, orderTypeId: parseInt(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  {orderTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.orderType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Selection */}
            <div className="space-y-2">
              <Label>Pickup *</Label>
              <Select
                value={formData.pickupId?.toString() || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, pickupId: parseInt(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pickup" />
                </SelectTrigger>
                <SelectContent>
                  {pickups?.map((pickup) => (
                    <SelectItem key={pickup.id} value={pickup.id.toString()}>
                      {pickup.pickup}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                placeholder="Order comment..."
                value={formData.comment || ''}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Bill Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bill"
                checked={formData.bill || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, bill: checked })
                }
              />
              <Label htmlFor="bill" className="cursor-pointer">
                Bill Paid
              </Label>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Order Items</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2 border rounded-md p-3">
                {formData.items?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No items added
                  </p>
                ) : (
                  formData.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      <Select
                        value={item.productId?.toString() || ''}
                        onValueChange={(value) =>
                          updateItem(index, 'productId', parseInt(value))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5">
                            <Input
                              placeholder="Search products..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {products.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={product.id.toString()}
                            >
                              {product.name} (PLU: {product.plu}) (Unit:{' '}
                              {product?.batches?.[0]?.unit?.unitType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, 'quantity', e.target.value)
                        }
                        className="w-24"
                        step="0.01"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="border rounded-md p-3 space-y-2">
                {services?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No services available
                  </p>
                ) : (
                  services?.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={
                          formData.services?.includes(service.id) || false
                        }
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <Label
                        htmlFor={`service-${service.id}`}
                        className="cursor-pointer"
                      >
                        {service.serviceType}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingOrder ? 'Update' : 'Create'}
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
