// SORTING
export const getSortOrder = (query, defaultSort = 'createdAt') => {
  const sortBy = query.sortBy || defaultSort;
  const order = query.order === 'desc' ? 'desc' : 'asc';
  return { [sortBy]: order };
};
