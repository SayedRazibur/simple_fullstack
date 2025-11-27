import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReferenceDataFormDialog({
  open,
  onOpenChange,
  mode = 'add',
  model,
  initialValue = '',
  onSubmit,
  isLoading = false,
}) {
  const [formValue, setFormValue] = useState(initialValue);

  const handleSubmit = () => {
    if (!formValue.trim()) {
      return;
    }
    onSubmit(formValue);
    setFormValue('');
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      setFormValue('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit' : 'Add'} {model}
          </DialogTitle>
        </DialogHeader>
        <Input
          placeholder={`Enter ${model}`}
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSubmit();
            }
          }}
          disabled={isLoading}
          autoFocus
        />
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formValue.trim()}
          >
            {isLoading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
