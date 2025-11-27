import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Plus } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput';
import ReferenceDataFormDialog from '@/components/common/ReferenceDataFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import useReferenceData from '@/hooks/useReferenceData';
import Loader from '@/components/common/Loader';

const MODELS = [
  { key: 'units', label: 'Units', field: 'unitType' },
  { key: 'recurrences', label: 'Recurrences', field: 'recurrenceType' },
  { key: 'order-types', label: 'Order Types', field: 'orderType' },
  { key: 'services', label: 'Services', field: 'serviceType' },
  { key: 'pickups', label: 'Pickups', field: 'pickup' },
  { key: 'entities', label: 'Entities', field: 'name' },
  { key: 'departments', label: 'Departments', field: 'name' },
];

export default function ReferenceDataPage() {
  const [activeTab, setActiveTab] = useState(MODELS[0].key);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({
    open: false,
    mode: 'add',
    data: null,
  });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const currentModel = MODELS.find((m) => m.key === activeTab);

  // Use the custom hook
  const {
    data,
    isFetching,
    create,
    update,
    delete: deleteItem,
  } = useReferenceData(activeTab, search);

  // OPEN EDIT
  const handleEdit = (item) => {
    setDialog({ open: true, mode: 'edit', data: item });
  };

  // OPEN ADD
  const handleAdd = () => {
    setDialog({ open: true, mode: 'add', data: null });
  };

  // HANDLE FORM SUBMIT (create or update)
  const handleFormSubmit = async (formValue) => {
    if (dialog.mode === 'edit') {
      await update.mutateAsync({
        id: dialog.data.id,
        data: { [currentModel.field]: formValue },
      });
    } else {
      await create.mutateAsync({
        [currentModel.field]: formValue,
      });
    }
    setDialog({ open: false, mode: 'add', data: null });
  };

  // HANDLE DELETE
  const handleConfirmDelete = async () => {
    await deleteItem.mutateAsync(confirm.id);
    setConfirm({ open: false, id: null });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-transparent p-0 flex gap-1">
          {MODELS.map((m) => (
            <TabsTrigger
              key={m.key}
              value={m.key}
              className="
        relative px-4 py-2 text-sm font-medium text-muted-foreground
        transition-all duration-300 ease-in-out
        data-[state=active]:text-primary
        after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0
        after:bg-gray-400 after:transition-all after:duration-300
        data-[state=active]:after:w-full
        hover:text-primary
      "
            >
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search + Add */}
        <div className="flex justify-between items-center my-4">
          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={setSearch}
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1 cursor-pointer " /> Add
          </Button>
        </div>

        {/* Data List */}
        {MODELS.map((m) => (
          <TabsContent key={m.key} value={m.key}>
            <Card>
              <CardContent className="divide-y">
                {isFetching ? (
                  <Loader />
                ) : !data?.length ? (
                  <p className="text-center py-6 text-muted-foreground">
                    No {m.label} found.
                  </p>
                ) : (
                  data.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-muted-foreground">#{i + 1}</span>
                      <span className="flex-1 ml-4">{item[m.field]}</span>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setConfirm({ open: true, id: item.id })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Dialog */}
      <ReferenceDataFormDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, mode: 'add', data: null })}
        mode={dialog.mode}
        model={currentModel?.label}
        initialValue={dialog.data ? dialog.data[currentModel?.field] : ''}
        onSubmit={handleFormSubmit}
        isLoading={create.isPending || update.isPending}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm({ open, id: null })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
