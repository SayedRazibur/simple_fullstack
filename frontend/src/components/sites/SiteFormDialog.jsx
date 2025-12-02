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
import { Label } from '@/components/ui/label';
import DaySelect from '@/components/common/DaySelect';

export default function SiteFormDialog({
  open,
  onOpenChange,
  editingSite,
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSite ? 'Edit Site' : 'Add New Site'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name *</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) =>
                setFormData({ ...formData, siteName: e.target.value })
              }
              placeholder="Enter site name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Day *</Label>
            <DaySelect
              value={formData.day || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, day: value })
              }
              allowAll={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor">Supervisor *</Label>
            <Input
              id="supervisor"
              value={formData.supervisor}
              onChange={(e) =>
                setFormData({ ...formData, supervisor: e.target.value })
              }
              placeholder="Enter supervisor name"
              required
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingSite ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
