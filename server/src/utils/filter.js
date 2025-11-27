// GENERIC TEXT FILTERS (search on multiple fields)
export const getSearchFilters = (query, allowedFields = []) => {
  const filters = {};
  if (query.search && allowedFields.length) {
    filters.OR = allowedFields.map((field) => ({
      [field]: { contains: query.search, mode: 'insensitive' },
    }));
  }
  return filters;
};

/**
 * Flexible date filter: supports specific date OR range
 * @param {Object} query - Express req.query
 * @param {string} field - DB field name (default: 'createdAt')
 * @returns {Object} Prisma where filter
 */
export const getDateFilter = (query, field = 'createdAt') => {
  const filters = {};

  // Case 1: Specific date (e.g., ?date=2025-11-16)
  if (query.date) {
    const date = new Date(query.date);
    if (!isNaN(date)) {
      // Match full day: from 00:00:00 to 23:59:59.999
      filters[field] = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }
  }
  // Case 2: Range (optional fallback)
  else if (query.startDate || query.endDate) {
    filters[field] = {};
    if (query.startDate) {
      const start = new Date(query.startDate);
      filters[field].gte = isNaN(start) ? undefined : start;
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      filters[field].lte = isNaN(end) ? undefined : end;
    }
    // Clean up empty object
    if (Object.keys(filters[field]).length === 0) delete filters[field];
  }

  return filters;
};

// COMBINE MULTIPLE FILTERS (e.g., text + date)
export const combineFilters = (...filters) => {
  return filters.reduce((acc, filter) => ({ ...acc, ...filter }), {});
};

// // If need to combine both search and date filters for another entity (like Document or Order):

// const textFilters = getFilters(req.query, ['title', 'description']);
// const dateFilters = getDateFilters(req.query, 'createdAt');
// const combined = combineFilters(textFilters, dateFilters);

// // Prisma query
// await prisma.document.findMany({ where: combined });

// DATE RANGE FILTER (Depricated version)
// export const getDateFilters = (query, field = 'createdAt') => {
//   const filters = {};
//   if (query.startDate || query.endDate) {
//     filters[field] = {};
//     if (query.startDate) filters[field].gte = new Date(query.startDate);
//     if (query.endDate) filters[field].lte = new Date(query.endDate);
//   }
//   return filters;
// };
