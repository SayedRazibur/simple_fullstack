import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSites from '@/hooks/useSites';
import SiteFormDialog from '@/components/sites/SiteFormDialog';
import RefillFormDialog from '@/components/sites/RefillFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import SiteSelect from '@/components/common/SiteSelect';
import DaySelect from '@/components/common/DaySelect';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { siteApi } from '@/services/sites.service';
import { refillApi } from '@/services/refills.service';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Sites() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  // UI State
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [refillDialogOpen, setRefillDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [editingRefill, setEditingRefill] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
    type: null,
  });
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [supervisorFilter, setSupervisorFilter] = useState('ALL');
  const todayDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][
    new Date().getDay()
  ];
  const [dayFilter, setDayFilter] = useState(todayDay);

  // Form states
  const [siteFormData, setSiteFormData] = useState({
    siteName: '',
    day: '',
    supervisor: '',
  });
  const [refillFormData, setRefillFormData] = useState({
    siteId: null,
    refills: [{ productId: '', quantity: 1 }],
  });
  const [editRefillFormData, setEditRefillFormData] = useState({
    quantity: 1,
  });

  // Fetch filtered sites
  const { data, isLoading, isError, refetch } = useSites({
    day: dayFilter === 'ALL' ? null : dayFilter,
    supervisor: supervisorFilter === 'ALL' ? null : supervisorFilter,
  });

  // Fetch ALL sites (unfiltered) for supervisor dropdown
  const { data: allSitesData } = useSites({});

  // FIXED: Correct data path is data.data.data.records (axios wraps response in data)
  const sites = data?.data?.data?.records || [];
  const allSites = allSitesData?.data?.data?.records || [];

  // Filter sites by selected site ID (client-side)
  const filteredSites = sites.filter(
    (site) => siteFilter === 'ALL' || site.id.toString() === siteFilter
  );

  // Get unique supervisors from ALL sites (not filtered)
  const uniqueSupervisors = useMemo(() => {
    const supervisors = new Set(allSites.map((s) => s.supervisor));
    return Array.from(supervisors).sort();
  }, [allSites]);

  // Mutations
  const saveSite = useMutation({
    mutationFn: (site) =>
      editingSite ? siteApi.update(editingSite.id, site) : siteApi.create(site),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success(editingSite ? 'Site updated!' : 'Site created!');
      setSiteDialogOpen(false);
      setEditingSite(null);
      setSiteFormData({ siteName: '', day: '', supervisor: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const deleteSite = useMutation({
    mutationFn: (id) => siteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setConfirmDelete({ open: false, id: null, type: null });
      toast.success('Site deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const saveRefill = useMutation({
    mutationFn: (refill) => refillApi.create(refill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Refill created!');
      setRefillDialogOpen(false);
      setRefillFormData({
        siteId: null,
        refills: [{ productId: '', quantity: 1 }],
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const updateRefill = useMutation({
    mutationFn: (data) => refillApi.update(editingRefill.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('Refill updated!');
      setEditingRefill(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const deleteRefill = useMutation({
    mutationFn: (id) => refillApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setConfirmDelete({ open: false, id: null, type: null });
      toast.success('Refill deleted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  // Handlers
  const handleEditSite = (site) => {
    setEditingSite(site);
    setSiteFormData({
      siteName: site.siteName,
      day: site.day,
      supervisor: site.supervisor,
    });
    setSiteDialogOpen(true);
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setSiteFormData({ siteName: '', day: '', supervisor: '' });
    setSiteDialogOpen(true);
  };

  const handleAddRefill = () => {
    setRefillFormData({
      siteId: null,
      refills: [{ productId: '', quantity: 1 }],
    });
    setRefillDialogOpen(true);
  };

  const handleEditRefill = (refill) => {
    setEditingRefill(refill);
    setEditRefillFormData({ quantity: refill.quantity });
  };

  const handleSiteSubmit = (e) => {
    e.preventDefault();
    saveSite.mutate(siteFormData);
  };

  const handleRefillSubmit = (e) => {
    e.preventDefault();
    saveRefill.mutate(refillFormData);
  };

  const handleRefillUpdateSubmit = (e) => {
    e.preventDefault();
    updateRefill.mutate(editRefillFormData);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
          <div className="w-[200px]">
            <DaySelect
              value={dayFilter}
              onValueChange={setDayFilter}
              allowAll={true}
            />
          </div>
          <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Supervisors</SelectItem>
              {uniqueSupervisors.map((supervisor) => (
                <SelectItem key={supervisor} value={supervisor}>
                  {supervisor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddRefill}>
            <Plus className="w-4 h-4 mr-1" /> Add Refill
          </Button>
          <Button onClick={handleAddSite}>
            <Plus className="w-4 h-4 mr-1" /> Add Site
          </Button>
        </div>
      </div>

      {/* Sites List */}
      <Card className="bg-muted/20">
        <CardContent className="p-6 space-y-4">
          {filteredSites.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No sites found. Try adjusting your filters.
            </p>
          ) : (
            filteredSites.map((site) => {
              const isExpanded = expandedId === site.id;
              return (
                <div
                  key={site.id}
                  className="rounded-md border border-border/40 bg-background/80 shadow-sm"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(site.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">#{site.id}</span>
                        <span className="font-semibold">{site.siteName}</span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-100"
                        >
                          {formatDay(site.day)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {site.supervisor}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {site.refills.length} Refills
                        </Badge>
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
                              handleEditSite(site);
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
                                id: site.id,
                                type: 'site',
                              });
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

                  {/* Expanded Section - Refills List */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 px-4 py-4">
                      <h4 className="text-sm font-semibold mb-3">Refills</h4>
                      {site.refills.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No refills for this site.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {site.refills.map((refill) => {
                            const isEditing = editingRefill?.id === refill.id;
                            const unit =
                              refill.product?.batches?.[0]?.unit?.unitType;

                            return (
                              <div
                                key={refill.id}
                                className="flex justify-between items-center p-2 bg-background rounded border text-sm"
                              >
                                <span>
                                  {refill.product.name} (PLU:{' '}
                                  {refill.product.plu})
                                </span>
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          min="1"
                                          className="w-32 h-8"
                                          value={editRefillFormData.quantity}
                                          onChange={(e) =>
                                            setEditRefillFormData({
                                              quantity:
                                                parseInt(e.target.value) || 1,
                                            })
                                          }
                                        />
                                        {unit && (
                                          <span className="text-xs text-muted-foreground">
                                            {unit}
                                          </span>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="h-8 px-2"
                                        onClick={handleRefillUpdateSubmit}
                                        disabled={updateRefill.isPending}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-2"
                                        onClick={() => setEditingRefill(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <Badge variant="secondary">
                                        Qty: {refill.quantity} {unit}
                                      </Badge>
                                      {isAdmin && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-cyan-600"
                                            onClick={() =>
                                              handleEditRefill(refill)
                                            }
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() =>
                                              setConfirmDelete({
                                                open: true,
                                                id: refill.id,
                                                type: 'refill',
                                              })
                                            }
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SiteFormDialog
        open={siteDialogOpen}
        onOpenChange={setSiteDialogOpen}
        editingSite={editingSite}
        formData={siteFormData}
        setFormData={setSiteFormData}
        onSubmit={handleSiteSubmit}
        isLoading={saveSite.isPending}
      />

      <RefillFormDialog
        open={refillDialogOpen}
        onOpenChange={setRefillDialogOpen}
        formData={refillFormData}
        setFormData={setRefillFormData}
        onSubmit={handleRefillSubmit}
        isLoading={saveRefill.isPending}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) =>
          setConfirmDelete({ open: v, id: null, type: null })
        }
        title={`Delete ${confirmDelete.type === 'site' ? 'Site' : 'Refill'}`}
        message="This action cannot be undone."
        onConfirm={() =>
          confirmDelete.type === 'site'
            ? deleteSite.mutate(confirmDelete.id)
            : deleteRefill.mutate(confirmDelete.id)
        }
        isLoading={deleteSite.isPending || deleteRefill.isPending}
      />
    </div>
  );
}
