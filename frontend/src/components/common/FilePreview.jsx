export default function FilePreview({ url, title }) {
  const ext = url.split('.').pop().toLowerCase();
  const type = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
    ? 'image'
    : ext === 'pdf'
    ? 'pdf'
    : ext === 'mp4'
    ? 'video'
    : ext === 'csv'
    ? 'csv'
    : ['xlsx', 'xls'].includes(ext)
    ? 'excel'
    : 'unknown';

  if (type === 'image')
    return (
      <img
        src={url}
        alt={title}
        className="max-w-full max-h-96 rounded object-contain"
      />
    );
  if (type === 'pdf')
    return (
      <iframe src={url} title={title} className="w-full h-96 border rounded" />
    );
  if (type === 'excel')
    return (
      <div className="p-4 rounded border text-sm text-muted-foreground">
        Excel file preview not supported.{' '}
        <a href={url} className="text-primary underline" download>
          Download
        </a>
      </div>
    );
  if (type === 'csv')
    return (
      <div className="p-4 rounded border text-sm text-muted-foreground">
        CSV file preview not supported.{' '}
        <a href={url} className="text-primary underline" download>
          Download
        </a>
      </div>
    );
  if (type === 'pdf')
    return (
      <iframe src={url} title={title} className="w-full h-96 border rounded" />
    );
  if (type === 'video')
    return <video controls src={url} className="w-full max-w-2xl rounded" />;
  return <p className="text-muted-foreground">Preview not available</p>;
}
