// ./src/utils/pagination.js
// ==========================================
// Pagination Utilities
// ==========================================

// OFFSET-BASED PAGINATION (default)
export const getOffsetPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// CURSOR-BASED PAGINATION
export const getCursorPagination = (query) => {
  const limit = Math.min(Number(query.limit) || 10, 100);
  const cursor = query.cursor ? { id: Number(query.cursor) } : undefined;
  return { limit, cursor };
};
