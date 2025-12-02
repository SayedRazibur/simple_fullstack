import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FilePreview from '@/components/common/FilePreview';

export default function DocumentViewDialog({ open, onClose, document }) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Document ID:</strong> {document.id}
            </p>
            {document.importedOn && (
              <p>
                <strong>Imported On:</strong>{' '}
                {new Date(document.importedOn).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Document Files/Links Preview */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Document Files</h3>
            {document.links && document.links.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document.links.map((url, index) => (
                  <div key={index}>
                    <FilePreview url={url} title={document.title} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No files available
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
