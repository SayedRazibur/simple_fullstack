import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  disabled,
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="justify-between mt-4">
      <PaginationContent className="flex justify-between items-center w-full">
        <PaginationItem>
          <PaginationPrevious
            onClick={onPrev}
            className={disabled || currentPage === 1 ? 'opacity-50' : ''}
            aria-disabled={disabled || currentPage === 1}
          />
        </PaginationItem>

        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>

        <PaginationItem>
          <PaginationNext
            onClick={onNext}
            className={
              disabled || currentPage === totalPages ? 'opacity-50' : ''
            }
            aria-disabled={disabled || currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
