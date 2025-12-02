import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import usePurchases from '@/hooks/usePurchases';
import PurchaseFormDialog from '@/components/purchases/PurchaseFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { purchaseApi } from '@/services/purchases.service';
import PickupSelect from '@/components/common/PickupSelect';
import SupplierSelect from '@/components/common/SupplierSelect';
import DaySelect from '@/components/common/DaySelect';
import DateFilter from '@/components/common/DateFilter';
import PaginationControls from '@/components/common/PaginationControls';
import { toast } from 'sonner';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function Purchases() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [page, setPage] = useState(1);
  const [pickupFilter, setPickupFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');

  // Default Day Filter: Current Day
  const todayDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][
    new Date().getDay()
  ];
  const [dayFilter, setDayFilter] = useState(todayDay);

  // Default Date Filter: Today
  const [dateFilter, setDateFilter] = useState(new Date());

  const [formData, setFormData] = useState({
    day: null,
    date: '',
    pickupId: null,
    supplierId: null,
    items: [],
  });

  const { data, isLoading, isError, refetch, isFetching } = usePurchases({
    limit: 10,
    page,
    order: 'asc',
    sortBy: 'date',
    pickupId: pickupFilter === 'ALL' ? null : parseInt(pickupFilter),
    supplierId: supplierFilter === 'ALL' ? null : parseInt(supplierFilter),
    day: dayFilter === 'ALL' ? null : dayFilter,
    date: dateFilter ? dateFilter.toISOString() : null,
  });

  const purchases = data?.data?.records || [];
  const pagination = data?.data?.pagination;

  // Group purchases by date, starting from today
  const groupedPurchases = useMemo(() => {
    const groups = purchases.reduce((acc, purchase) => {
      // Use date if available, otherwise use current date for day-based purchases
      const dateKey = purchase.date
        ? purchase.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(purchase);
      return acc;
    }, {});

    // Sort by date (ascending)
    // Note: Backend already filters by date >= today if date filter is set
    return Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
    );
  }, [purchases]);

  const savePurchase = useMutation({
    mutationFn: (purchase) =>
      editingPurchase
        ? purchaseApi.update(editingPurchase.id, purchase)
        : purchaseApi.create(purchase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success(
        editingPurchase
          ? 'Purchase updated successfully!'
          : 'Purchase added successfully!'
      );
      setDialogOpen(false);
      setEditingPurchase(null);
      setFormData({
        day: null,
        date: '',
        pickupId: null,
        supplierId: null,
        items: [],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const deletePurchase = useMutation({
    mutationFn: (id) => purchaseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setConfirmDelete({ open: false, id: null });
      toast.success('Purchase deleted successfully!');
    },
    onError: (error) => {
      setConfirmDelete({ open: false, id: null });
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      day: purchase.day || null,
      date: purchase.date ? purchase.date.split('T')[0] : '',
      pickupId: purchase.pickupId,
      supplierId: purchase.supplierId,
      items: purchase.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPurchase(null);
    setFormData({
      day: null,
      date: '',
      pickupId: null,
      supplierId: null,
      items: [],
    });
    setDialogOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = () => {
    // Prepare data
    const submitData = {
      ...(formData.day && { day: formData.day }),
      ...(formData.date && { date: new Date(formData.date).toISOString() }),
      pickupId: formData.pickupId,
      supplierId: formData.supplierId,
      items: formData.items.map((item) => ({
        ...(item.id && { id: item.id }),
        productId: item.productId,
        quantity: parseFloat(item.quantity),
      })),
    };

    savePurchase.mutate(submitData);
  };

  const formatDay = (day) => {
    const days = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
    };
    return days[day] || day;
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PickupSelect
              value={pickupFilter}
              onValueChange={(v) => {
                setPickupFilter(v);
                setPage(1);
              }}
              allowAll={true}
            />
            <SupplierSelect
              value={supplierFilter}
              onValueChange={(v) => {
                setSupplierFilter(v);
                setPage(1);
              }}
              allowAll={true}
            />
            <DaySelect
              value={dayFilter}
              onValueChange={(v) => {
                setDayFilter(v);
                setPage(1);
              }}
              allowAll={true}
            />
            <DateFilter
              selectedDate={dateFilter}
              onDateChange={(date) => {
                setDateFilter(date);
                setPage(1);
              }}
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Purchase
          </Button>
        </div>
      </div>

      {/* Purchase Rows - Grouped by Date */}
      <Card className="bg-muted/20">
        <CardContent className="p-6 space-y-8">
          {groupedPurchases.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No purchases found. Try adjusting your filters.
            </p>
          ) : (
            groupedPurchases.map(([dateKey, datePurchases]) => (
              <div key={dateKey} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {getDateHeading(dateKey)}
                </h3>
                <div className="space-y-3">
                  {datePurchases.map((purchase) => {
                    const isExpanded = expandedId === purchase.id;
                    return (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between rounded-md border border-border/40 bg-background/80 px-4 py-3 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1"
                          onClick={() => toggleExpand(purchase.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-2">
                              {/* Main Row Info */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-medium">
                                  #{purchase.id}
                                </span>
                                <span className="font-semibold">
                                  {purchase.supplier.name}
                                </span>
                                {purchase.day && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100"
                                  >
                                    {formatDay(purchase.day)}
                                  </Badge>
                                )}
                                {purchase.date && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-100"
                                  >
                                    {format(
                                      new Date(purchase.date),
                                      'MMM dd, yyyy'
                                    )}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {purchase.pickup.pickup}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {purchase.items.length} Items
                                </Badge>
                              </div>

                              {/* Dropdown Details */}
                              {isExpanded && (
                                <div className="bg-muted/30 -mx-4 px-4 py-4 space-y-4 mt-3">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">
                                      Items
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {purchase.items.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex justify-between items-center p-2 bg-background rounded border text-sm"
                                        >
                                          <span>{item.product.name}</span>
                                          <Badge variant="secondary">
                                            Qty: {item.quantity}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
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
                                  handleEdit(purchase);
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
                                  setConfirmDelete({
                                    open: true,
                                    id: purchase.id,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {isExpanded ? (
                            <ChevronUp
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => toggleExpand(purchase.id)}
                            />
                          ) : (
                            <ChevronDown
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => toggleExpand(purchase.id)}
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
      <PurchaseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPurchase={editingPurchase}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={savePurchase.isPending}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Purchase"
        message="This action cannot be undone."
        onConfirm={() => deletePurchase.mutate(confirmDelete.id)}
        isLoading={deletePurchase.isPending}
      />
    </div>
  );
}
