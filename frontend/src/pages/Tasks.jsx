// src/pages/Tasks.jsx
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useTasks from '@/hooks/useTasks';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { taskApi } from '@/services/tasks.service';
import EntitySelect from '@/components/common/EntitySelect';
import DaySelect from '@/components/common/DaySelect';
import { toast } from 'sonner';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import FilePreview from '@/components/common/FilePreview';

export default function Tasks() {
  const { isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);
  const [entityFilter, setEntityFilter] = useState('ALL');
  const todayDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][
    new Date().getDay()
  ];
  const [dayFilter, setDayFilter] = useState(todayDay);

  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    quantity: 1,
    day: null,
    date: '',
    entityId: null,
    productId: null,
    orderId: null,
    documentId: null,
  });

  const { data, isLoading, isFetching, isError, refetch } = useTasks({
    limit: 100, // Get more tasks for better grouping
    search,
    order: 'asc',
    sortBy: 'date',
    entityId: entityFilter === 'ALL' ? null : parseInt(entityFilter),
    day: dayFilter === 'ALL' ? null : dayFilter,
  });

  const tasks = data?.data?.records || [];

  // Group tasks by date, starting from today
  const groupedTasks = useMemo(() => {
    const groups = tasks.reduce((acc, task) => {
      // Use date if available, otherwise use current date for day-based tasks
      const dateKey = task.date
        ? task.date.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(task);
      return acc;
    }, {});

    // Sort by date (ascending) and filter to start from today
    const today = new Date().toISOString().slice(0, 10);
    return Object.entries(groups)
      .filter(([dateKey]) => dateKey >= today)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
  }, [tasks]);

  const saveTask = useMutation({
    mutationFn: (task) =>
      editingTask ? taskApi.update(editingTask.id, task) : taskApi.create(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(
        editingTask ? 'Task updated successfully!' : 'Task added successfully!'
      );
      setDialogOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        comment: '',
        quantity: 1,
        day: null,
        date: '',
        entityId: null,
        productId: null,
        orderId: null,
        documentId: null,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setConfirmDelete({ open: false, id: null });
      toast.success('Task deleted successfully!');
    },
    onError: (error) => {
      setConfirmDelete({ open: false, id: null });
      toast.error(error.response?.data?.message || 'An error occurred');
    },
  });

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      comment: task.comment || '',
      quantity: task.quantity,
      day: task.day || null,
      date: task.date ? task.date.split('T')[0] : '',
      entityId: task.entityId || null,
      productId: task.productId || null,
      orderId: task.orderId || null,
      documentId: task.documentId || null,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      comment: '',
      quantity: 1,
      day: null,
      date: '',
      entityId: null,
      productId: null,
      orderId: null,
      documentId: null,
    });
    setDialogOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = () => {
    // Prepare data
    const submitData = {
      title: formData.title,
      quantity: parseFloat(formData.quantity),
      ...(formData.comment && { comment: formData.comment }),
      ...(formData.day && { day: formData.day }),
      ...(formData.date && { date: new Date(formData.date).toISOString() }),
      ...(formData.entityId && { entityId: formData.entityId }),
      ...(formData.productId && { productId: formData.productId }),
      ...(formData.orderId && { orderId: formData.orderId }),
      ...(formData.documentId && { documentId: formData.documentId }),
    };

    saveTask.mutate(submitData);
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
            <SearchInput
              placeholder="Search tasks..."
              value={search}
              onChange={(v) => {
                setSearch(v);
              }}
            />
            <EntitySelect
              value={entityFilter}
              onValueChange={setEntityFilter}
              allowAll={true}
            />
            <DaySelect
              value={dayFilter}
              onValueChange={setDayFilter}
              allowAll={true}
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </Button>
        </div>
      </div>

      {/* Task Rows - Grouped by Date */}
      <Card className="bg-muted/20">
        <CardContent className="p-6 space-y-8">
          {groupedTasks.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No tasks found starting from today.
            </p>
          ) : (
            groupedTasks.map(([dateKey, dateTasks]) => (
              <div key={dateKey} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {getDateHeading(dateKey)}
                </h3>
                <div className="space-y-3">
                  {dateTasks.map((task) => {
                    const isExpanded = expandedId === task.id;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-md border border-border/40 bg-background/80 px-4 py-3 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1"
                          onClick={() => toggleExpand(task.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-2">
                              {/* Main Row Info */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-medium">#{task.id}</span>
                                <span className="font-semibold">
                                  {task.title}
                                </span>
                                {task.day && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-100"
                                  >
                                    {formatDay(task.day)}
                                  </Badge>
                                )}
                                {task.date && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-100"
                                  >
                                    {format(
                                      new Date(task.date),
                                      'MMM dd, yyyy'
                                    )}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  Qty: {task.quantity}
                                </Badge>
                              </div>

                              {/* Dropdown Details */}
                              {isExpanded && (
                                <div className="bg-muted/30 -mx-4 px-4 py-4 space-y-4 mt-3">
                                  <div className="grid grid-cols-1 gap-2 text-sm">
                                    {task.entity && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Entity:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {task.entity.name}
                                        </span>
                                      </div>
                                    )}
                                    {task.product && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Product:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {task.product.name} (PLU:{' '}
                                          {task.product.plu})
                                        </span>
                                      </div>
                                    )}
                                    {task.order && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Order:{' '}
                                        </span>
                                        <span className="font-medium">
                                          #{task.order.id} -{' '}
                                          {format(
                                            new Date(task.order.date),
                                            'MMM dd, yyyy'
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {task.document && (
                                      <div className="space-y-2">
                                        <span className="text-muted-foreground">
                                          Document:{' '}
                                        </span>
                                        <div className="space-y-2">
                                          <Badge
                                            variant="outline"
                                            className="flex items-center gap-1 w-fit"
                                          >
                                            <FileText className="w-3 h-3" />
                                            {task.document.title}
                                          </Badge>
                                          {task.document.links &&
                                          task.document.links.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                              {task.document.links.map(
                                                (link, idx) => (
                                                  <FilePreview
                                                    key={idx}
                                                    url={link}
                                                    title={task.document.title}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-muted-foreground pl-2">
                                              No preview available
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {task.comment && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Comment:{' '}
                                        </span>
                                        <span className="font-medium">
                                          {task.comment}
                                        </span>
                                      </div>
                                    )}
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
                                  handleEdit(task);
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
                                  setConfirmDelete({ open: true, id: task.id });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {isExpanded ? (
                            <ChevronUp
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => toggleExpand(task.id)}
                            />
                          ) : (
                            <ChevronDown
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => toggleExpand(task.id)}
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

      {/* Dialogs */}
      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTask={editingTask}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={saveTask.isPending}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(v) => setConfirmDelete({ open: v, id: null })}
        title="Delete Task"
        message="This action cannot be undone."
        onConfirm={() => deleteTask.mutate(confirmDelete.id)}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
