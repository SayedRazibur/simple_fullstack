import { format } from 'date-fns';
import { CalendarIcon, Upload, FileText, Building2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function ReminderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  form,
  setForm,
  documents,
  entities,
  docSearch,
  setDocSearch,
  entitySearch,
  setEntitySearch,
  onFileUpload,
  isLoading,
  isUploading,
}) {
  const toggleDocument = (doc) => {
    setForm((prev) => {
      const exists = prev.documents.find((d) => d.id === doc.id);
      if (exists) {
        return {
          ...prev,
          documents: prev.documents.filter((d) => d.id !== doc.id),
        };
      }
      return { ...prev, documents: [...prev.documents, doc] };
    });
  };

  const toggleEntity = (entity) => {
    setForm((prev) => {
      const exists = prev.entities.find((e) => e.id === entity.id);
      if (exists) {
        return {
          ...prev,
          entities: prev.entities.filter((e) => e.id !== entity.id),
        };
      }
      return { ...prev, entities: [...prev.entities, entity] };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Reminder</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={onSubmit} className="space-y-4 pr-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isLoading}
              required
            />

            <Textarea
              placeholder="Comment (optional)"
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              disabled={isLoading}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Reminder Date
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.date ? format(form.date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(date) =>
                        setForm((prev) => ({
                          ...prev,
                          date: date || prev.date,
                        }))
                      }
                      disabled={isLoading}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Reminder Time
                </p>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Documents
                </p>
                <label>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={onFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </span>
                  </Button>
                </label>
              </div>

              <Input
                placeholder="Search documents..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
              />

              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50',
                      form.documents.find((d) => d.id === doc.id) &&
                        'bg-primary/10'
                    )}
                    onClick={() => toggleDocument(doc)}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm flex-1">{doc.title}</span>
                  </div>
                ))}
              </div>

              {form.documents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.documents.map((doc) => (
                    <Badge
                      key={doc.id}
                      variant="secondary"
                      className="flex items-center gap-1 max-w-[200px]"
                    >
                      <span className="truncate" title={doc.title}>
                        {doc.title}
                      </span>
                      <span>
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer shrink-0"
                          onClick={() => toggleDocument(doc)}
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Entities Section */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Entities
              </p>
              <Input
                placeholder="Search entities..."
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
              />

              <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                {entities.map((entity) => (
                  <div
                    key={entity.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50',
                      form.entities.find((e) => e.id === entity.id) &&
                        'bg-primary/10'
                    )}
                    onClick={() => toggleEntity(entity)}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm flex-1">{entity.name}</span>
                  </div>
                ))}
              </div>

              {form.entities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.entities.map((entity) => (
                    <Badge key={entity.id} variant="secondary">
                      {entity.name}
                      <span>
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => toggleEntity(entity)}
                        />
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Reminder'}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
