import { Button } from '@/components/ui/button';

export default function ErrorState({ onRetry }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="text-center text-destructive">
        <p>Failed to load data. Please try again.</p>
        <Button onClick={onRetry} className="mt-4">
          Retry
        </Button>
      </div>
    </div>
  );
}
