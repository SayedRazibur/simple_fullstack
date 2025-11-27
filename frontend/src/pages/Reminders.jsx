import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDays,
  format,
  formatISO,
  isToday,
  isTomorrow,
  parseISO,
} from 'date-fns';
import { toast } from 'sonner';
import { CalendarDays, List, Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchInput from '@/components/common/SearchInput';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DateFilter from '@/components/common/DateFilter';
import ReminderFormDialog from '@/components/reminder/ReminderFormDialog';
import ReminderViewEditDialog from '@/components/reminder/ReminderViewEditDialog';
import { reminderApi } from '@/services/reminders.service';
import { documentApi } from '@/services/documents.service';
import useReminders from '@/hooks/useReminders';
import useDocuments from '@/hooks/useDocuments';
import useReferenceData from '@/hooks/useReferenceData';
import { cn } from '@/lib/utils';

const getDefaultFormState = () => {
  const now = new Date();
  return {
    title: '',
    comment: '',
    date: now,
    time: format(now, 'HH:mm'),
    documents: [],
    entities: [],
    uploadedFiles: [],
  };
};

const HOURS = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
];

export default function ReminderScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cursorDate, setCursorDate] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [form, setForm] = useState(getDefaultFormState);
  const [deleteId, setDeleteId] = useState(null);
  const [weekStart, setWeekStart] = useState(new Date());

  // Search states for documents and entities
  const [docSearch, setDocSearch] = useState('');
  const [entitySearch, setEntitySearch] = useState('');

  useEffect(() => {
    setWeekStart(cursorDate || new Date());
  }, [cursorDate]);

  const limit = viewMode === 'calendar' ? 100 : 15;
  const cursorParam = cursorDate ? cursorDate.toISOString() : null;

  const {
    data: remindersData,
    isLoading,
    isError,
    refetch,
  } = useReminders({
    limit,
    search,
    order: 'asc',
    sortBy: 'date',
    cursor: cursorParam,
  });

  // Fetch documents and entities for selection
  const { data: documentsData } = useDocuments({
    page: 1,
    limit: 50,
    search: docSearch,
  });

  const { data: entitiesData } = useReferenceData('entities', entitySearch);

  const reminders = remindersData?.data?.records || [];
  const documents = documentsData?.data?.records || [];
  const entities = entitiesData || [];

  const groupedReminders = useMemo(() => {
    const groups = reminders.reduce((acc, reminder) => {
      const dateKey = reminder.date.slice(0, 10);
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(reminder);
      return acc;
    }, {});

    return Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
    );
  }, [reminders]);

  const remindersByDateAndHour = useMemo(() => {
    const grouped = {};

    reminders.forEach((reminder) => {
      const dateKey = reminder.date.slice(0, 10);
      const reminderDate = new Date(reminder.date);
      const hour = reminderDate.getHours();

      if (!grouped[dateKey]) grouped[dateKey] = {};
      if (!grouped[dateKey][hour]) grouped[dateKey][hour] = [];
      grouped[dateKey][hour].push(reminder);
    });

    return grouped;
  }, [reminders]);

  const weekDays = useMemo(
    () => Array.from({ length: 3 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const createReminderMutation = useMutation({
    mutationFn: (payload) => reminderApi.create(payload),
    onSuccess: () => {
      toast.success('Reminder created successfully');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsAddOpen(false);
      setForm(getDefaultFormState());
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to create reminder. Try again.'
      );
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, data }) => reminderApi.update(id, data),
    onSuccess: () => {
      toast.success('Reminder updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsViewOpen(false);
      setIsEditMode(false);
      setSelectedReminder(null);
      setForm(getDefaultFormState());
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to update reminder. Try again.'
      );
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => reminderApi.delete(id),
    onSuccess: () => {
      toast.success('Reminder deleted');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setDeleteId(null);
      setIsViewOpen(false);
      setSelectedReminder(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to delete reminder. Try again.'
      );
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (data) => documentApi.create(data),
    onSuccess: (response) => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      // Add uploaded document to form
      if (response.data) {
        setForm((prev) => ({
          ...prev,
          documents: [...prev.documents, response.data],
        }));
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to upload document.'
      );
    },
  });

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toast.warning('Title and date are required');
      return;
    }

    const [hoursRaw, minutesRaw] = (form.time || '00:00')
      .split(':')
      .map((value) => Number(value));

    const year = form.date.getFullYear();
    const month = form.date.getMonth();
    const day = form.date.getDate();
    const scheduledDate = new Date(
      year,
      month,
      day,
      hoursRaw,
      minutesRaw,
      0,
      0
    );

    const payload = {
      title: form.title.trim(),
      comment: form.comment?.trim() || undefined,
      date: scheduledDate.toISOString(),
      documentIds: form.documents.map((doc) => doc.id),
      entityIds: form.entities.map((entity) => entity.id),
    };

    createReminderMutation.mutate(payload);
  };

  const handleUpdateReminder = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !selectedReminder) {
      toast.warning('Title and date are required');
      return;
    }

    const [hoursRaw, minutesRaw] = (form.time || '00:00')
      .split(':')
      .map((value) => Number(value));

    const year = form.date.getFullYear();
    const month = form.date.getMonth();
    const day = form.date.getDate();
    const scheduledDate = new Date(
      year,
      month,
      day,
      hoursRaw,
      minutesRaw,
      0,
      0
    );

    const payload = {
      title: form.title.trim(),
      comment: form.comment?.trim() || undefined,
      date: scheduledDate.toISOString(),
      documentIds: form.documents.map((doc) => doc.id),
      entityIds: form.entities.map((entity) => entity.id),
    };

    updateReminderMutation.mutate({ id: selectedReminder.id, data: payload });
  };

  const handleDialogChange = (open) => {
    if (!open) {
      setForm(getDefaultFormState());
      setDocSearch('');
      setEntitySearch('');
    }
    setIsAddOpen(open);
  };

  const handleViewDialogChange = (open) => {
    setIsViewOpen(open);
    if (!open) {
      setSelectedReminder(null);
      setIsEditMode(false);
      setForm(getDefaultFormState());
      setDocSearch('');
      setEntitySearch('');
    }
  };

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    setIsViewOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    if (selectedReminder) {
      const reminderDate = new Date(selectedReminder.date);
      setForm({
        title: selectedReminder.title,
        comment: selectedReminder.comment || '',
        date: reminderDate,
        time: format(reminderDate, 'HH:mm'),
        documents: selectedReminder.documents || [],
        entities: selectedReminder.entities || [],
        uploadedFiles: [],
      });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setForm(getDefaultFormState());
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      await uploadDocumentMutation.mutateAsync({
        title: file.name,
        files: [file],
      });
    }
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

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            placeholder="Search reminders..."
            value={search}
            onChange={(value) => {
              setSearch(value);
              setCursorDate(null);
            }}
          />
          <DateFilter selectedDate={cursorDate} onDateChange={setCursorDate} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setViewMode((prev) => (prev === 'list' ? 'calendar' : 'list'))
            }
          >
            {viewMode === 'list' ? (
              <>
                <CalendarDays className="mr-2 h-4 w-4" />
                Switch to Calendar
              </>
            ) : (
              <>
                <List className="mr-2 h-4 w-4" />
                Switch to List
              </>
            )}
          </Button>
          <Button onClick={() => handleDialogChange(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card className="bg-muted/20">
          <CardContent className="p-6 space-y-8">
            {groupedReminders.length === 0 && (
              <p className="text-center text-muted-foreground">
                No reminders found. Try adjusting your filters.
              </p>
            )}

            {groupedReminders.map(([dateKey, items]) => (
              <div key={dateKey} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {getDateHeading(dateKey)}
                </h3>
                <div className="space-y-3">
                  {items.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between rounded-md border border-border/40 bg-background/80 px-4 py-3 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewReminder(reminder)}
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <span className="mt-2">
                          <Minus className="h-4 w-4 text-primary" />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {reminder.title}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {format(new Date(reminder.date), 'p')}
                          </p>
                          {reminder.comment && (
                            <p className="text-sm text-muted-foreground">
                              {reminder.comment}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(reminder.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Week of</p>
              <h2 className="text-2xl font-semibold">
                {format(weekStart, 'MMMM d, yyyy')}
              </h2>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
            <div className="grid grid-cols-[100px_repeat(3,1fr)] border-b bg-muted/40 text-sm font-semibold">
              <div className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Time
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-l px-4 py-3 text-center',
                    isToday(day) && 'bg-primary/10'
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {format(day, 'EEE')}
                  </p>
                  <p className="text-lg font-semibold">{format(day, 'd')}</p>
                </div>
              ))}
            </div>

            {HOURS.map((hourLabel, hourIndex) => (
              <div
                key={hourLabel}
                className="grid grid-cols-[100px_repeat(3,1fr)] border-b last:border-b-0"
              >
                <div className="border-r bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                  {hourLabel}
                </div>

                {weekDays.map((day) => {
                  const key = formatISO(day, { representation: 'date' });
                  const hourReminders =
                    remindersByDateAndHour[key]?.[hourIndex] || [];

                  return (
                    <div
                      key={key}
                      className={cn(
                        'border-l p-3 min-h-[60px]',
                        isToday(day) && 'bg-primary/5'
                      )}
                    >
                      <div className="space-y-2">
                        {hourReminders.map((reminder) => (
                          <div
                            key={reminder.id}
                            className="rounded-lg border border-primary/30 bg-primary/10 p-2 shadow-sm cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => handleViewReminder(reminder)}
                          >
                            <p className="text-sm font-medium text-foreground truncate">
                              {reminder.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(reminder.date), 'h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <ReminderFormDialog
        open={isAddOpen}
        onOpenChange={handleDialogChange}
        onSubmit={handleAddReminder}
        form={form}
        setForm={setForm}
        documents={documents}
        entities={entities}
        docSearch={docSearch}
        setDocSearch={setDocSearch}
        entitySearch={entitySearch}
        setEntitySearch={setEntitySearch}
        onFileUpload={handleFileUpload}
        isLoading={createReminderMutation.isPending}
        isUploading={uploadDocumentMutation.isPending}
      />

      {/* View/Edit Dialog */}
      <ReminderViewEditDialog
        open={isViewOpen}
        onOpenChange={handleViewDialogChange}
        reminder={selectedReminder}
        isEditMode={isEditMode}
        onEditClick={handleEditClick}
        onSubmit={handleUpdateReminder}
        onCancelEdit={handleCancelEdit}
        form={form}
        setForm={setForm}
        documents={documents}
        entities={entities}
        docSearch={docSearch}
        setDocSearch={setDocSearch}
        entitySearch={entitySearch}
        setEntitySearch={setEntitySearch}
        onFileUpload={handleFileUpload}
        isLoading={updateReminderMutation.isPending}
        isUploading={uploadDocumentMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteReminderMutation.mutate(deleteId)}
        title="Delete Reminder"
        description="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteReminderMutation.isPending}
      />
    </div>
  );
}
