// src/pages/Orders.jsx
import { useState, useMemo } from 'react';
import useOrders, {
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from '@/hooks/useOrders';
import useReferenceData from '@/hooks/useReferenceData';
import OrderFormDialog from '@/components/orders/OrderFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import ClientSelect from '@/components/common/ClientSelect';
import DateFilter from '@/components/common/DateFilter';
import PaginationControls from '@/components/common/PaginationControls';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Minus,
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
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

export default function Orders() {
  const { isAdmin } = useAuthStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [pickupId, setPickupId] = useState('');
  const [orderTypeId, setOrderTypeId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({
    clientId: '',
    orderTypeId: '',
    pickupId: '',
    date: '',
    comment: '',
    bill: false,
    items: [],
    services: [],
    documentIds: [],
  });

  const { data, isLoading, isFetching, isError, refetch } = useOrders({
    page,
    limit: 10,
    pickupId,
    orderTypeId,
    serviceId,
    clientId,
    search,
    date: dateFilter,
  });

  // Fetch reference data for filters
  const { data: pickups } = useReferenceData('pickups');
  const { data: orderTypes } = useReferenceData('order-types');
  const { data: services } = useReferenceData('services');

  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const orders = data?.data?.records || [];
  const pagination = data?.data?.pagination;

  // Group orders by date (no client filtering needed - backend handles it)
  const groupedOrders = useMemo(() => {
    const groups = orders.reduce((acc, order) => {
      const dateKey = order.date.slice(0, 10);
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(order);
      return acc;
    }, {});

    return Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
    );
  }, [orders]);

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      clientId: order.client?.id || '',
      orderTypeId: order.orderType?.id || '',
      pickupId: order.pickup?.id || '',
      date: order.date ? new Date(order.date).toISOString().slice(0, 16) : '',
      comment: order.comment || '',
      bill: order.bill || false,
      items:
        order.items?.map((item) => ({
          id: item.id,
          productId: item.product?.id || '',
          quantity: item.quantity?.toString() || '',
        })) || [],
      services: order.services?.map((s) => s.id) || [],
      documentIds: order.documents?.map((d) => d.id) || [],
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({
      clientId: '',
      orderTypeId: '',
      pickupId: '',
      date: '',
      comment: '',
      bill: false,
      items: [],
      services: [],
      documentIds: [],
    });
    setDialogOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = () => {
    const payload = {
      clientId: formData.clientId,
      orderTypeId: formData.orderTypeId,
      pickupId: formData.pickupId,
      date: new Date(formData.date).toISOString(),
      comment: formData.comment || undefined,
      bill: formData.bill,
      items: formData.items
        .filter((item) => item.productId && item.quantity)
        .map((item) => ({
          id: item.id || undefined,
          productId: item.productId,
          quantity: parseFloat(item.quantity),
        })),
      services: formData.services,
      documentIds: formData.documentIds,
    };

    if (editingOrder) {
      updateOrder.mutate(
        { id: editingOrder.id, data: payload },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingOrder(null);
          },
        }
      );
    } else {
      createOrder.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (id) => {
    deleteOrder.mutate(id, {
      onSuccess: () => {
        setConfirmDelete({ open: false, id: null });
      },
    });
  };

  const getDateHeading = (dateString) => {
    const date = parseISO(dateString);
    let suffix = '';

    if (isToday(date)) {
      suffix = ' - Today';
    } else if (isTomorrow(date)) {
      suffix = ' - Tomorrow';
    }

    return `${format(date, 'MMMM d, yyyy')}${suffix}`;
  };

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          {/* Client Filter */}
          <ClientSelect
            value={clientId || 'ALL'}
            onValueChange={(value) => {
              setClientId(value === 'ALL' ? '' : value);
              setPage(1);
            }}
          />

          {/* Pickup Filter */}
          <Select
            value={pickupId || 'ALL'}
            onValueChange={(value) => {
              setPickupId(value === 'ALL' ? '' : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Pickup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Pickups</SelectItem>
              {pickups?.map((pickup) => (
                <SelectItem key={pickup.id} value={pickup.id.toString()}>
                  {pickup.pickup}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Order Type Filter */}
          <Select
            value={orderTypeId || 'ALL'}
            onValueChange={(value) => {
              setOrderTypeId(value === 'ALL' ? '' : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {orderTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.orderType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Service Filter */}
          <Select
            value={serviceId || 'ALL'}
            onValueChange={(value) => {
              setServiceId(value === 'ALL' ? '' : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Services</SelectItem>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.serviceType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <DateFilter
            selectedDate={dateFilter}
            onDateChange={(date) => {
              setDateFilter(date);
              setPage(1);
            }}
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Order
        </Button>
      </div>

      {/* Order Rows - Grouped by Date */}
      <Card className="bg-muted/20">
        <CardContent className="p-6 space-y-8">
          {groupedOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No orders found. Try adjusting your filters.
            </p>
          ) : (
            groupedOrders.map(([dateKey, dateOrders]) => (
              <div key={dateKey} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {getDateHeading(dateKey)}
                </h3>
                <div className="space-y-3">
                  {dateOrders.map((o) => {
                    const isExpanded = expandedId === o.id;
                    return (
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-md border border-border/40 bg-background/80 px-4 py-3 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1"
                          onClick={() => toggleExpand(o.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-2">
                              {/* Main Row Info */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-medium">#{o.id}</span>
                                <span className="font-semibold">
                                  {o.client?.firstName}{' '}
                                  {o.client?.surname || ''}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {format(new Date(o.date), 'p')}
                                </Badge>
                                {o.bill ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-300"
                                  >
                                    Bill Paid
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-red-300"
                                  >
                                    Bill Not Paid
                                  </Badge>
                                )}
                              </div>

                              {/* Client Details */}
                              <div className="text-sm text-muted-foreground space-y-1">
                                {o.client?.email && (
                                  <div>Email: {o.client.email}</div>
                                )}
                                {o.client?.phone && (
                                  <div>Phone: {o.client.phone}</div>
                                )}
                                {o.client?.address && (
                                  <div>Address: {o.client.address}</div>
                                )}
                              </div>

                              {/* Dropdown Details */}
                              {isExpanded && (
                                <div className="bg-muted/30 -mx-4 px-4 py-4 space-y-4 mt-3">
                                  {/* Basic Order Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Order Type:{' '}
                                      </span>
                                      <span className="font-medium">
                                        {o.orderType?.orderType || '—'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Pickup:{' '}
                                      </span>
                                      <span className="font-medium">
                                        {o.pickup?.pickup || '—'}
                                      </span>
                                    </div>
                                    {o.comment && (
                                      <div className="col-span-full">
                                        <span className="text-muted-foreground">
                                          Comment:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {o.comment}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Order Items */}
                                  {o.items && o.items.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">
                                        Order Items
                                      </h4>
                                      <div className="overflow-x-auto border rounded-md">
                                        <table className="w-full text-xs">
                                          <thead className="bg-muted/50">
                                            <tr>
                                              <th className="text-left p-2 font-medium">
                                                Product
                                              </th>
                                              <th className="text-left p-2 font-medium">
                                                PLU
                                              </th>
                                              <th className="text-left p-2 font-medium">
                                                Quantity
                                              </th>
                                              <th className="text-left p-2 font-medium">
                                                Unit
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {o.items.map((item, idx) => (
                                              <tr
                                                key={item.id || idx}
                                                className="border-t hover:bg-muted/30"
                                              >
                                                <td className="p-2">
                                                  {item.product?.name || '—'}
                                                </td>
                                                <td className="p-2">
                                                  {item.product?.plu || '—'}
                                                </td>
                                                <td className="p-2">
                                                  {item.quantity}
                                                </td>
                                                <td className="p-2">
                                                  {item.product?.batches?.[0]
                                                    ?.unit?.unitType || '—'}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  {/* Services */}
                                  {o.services && o.services.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">
                                        Services
                                      </h4>
                                      <div className="flex gap-2 flex-wrap">
                                        {o.services.map((service) => (
                                          <Badge
                                            key={service.id}
                                            variant="secondary"
                                          >
                                            {service.serviceType}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Documents */}
                                  {o.documents && o.documents.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold">
                                        Documents
                                      </h4>
                                      <div className="flex gap-2 flex-wrap">
                                        {o.documents.map((doc) => (
                                          <Badge
                                            key={doc.id}
                                            variant="outline"
                                            className="flex items-center gap-1"
                                          >
                                            <FileText className="w-3 h-3" />
                                            {doc.title}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-cyan-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(o);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete({ open: true, id: o.id });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {isExpanded ? (
                            <ChevronUp
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => toggleExpand(o.id)}
                            />
                          ) : (
                            <ChevronDown
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => toggleExpand(o.id)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
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
          disabled={isFetching}
        />
      )}

      {/* Dialogs */}
      <OrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingOrder={editingOrder}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={createOrder.isPending || updateOrder.isPending}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Order"
        message="This action cannot be undone."
        onConfirm={() => handleDelete(confirmDelete.id)}
        isLoading={deleteOrder.isPending}
      />
    </div>
  );
}
