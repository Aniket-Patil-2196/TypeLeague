export const getNormalizedId = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val._id) return val._id.toString();
  if (typeof val.toString === 'function') return val.toString();
  return String(val);
};

export const areIdsEqual = (idA, idB) => {
  const strA = getNormalizedId(idA);
  const strB = getNormalizedId(idB);
  return Boolean(strA && strB && strA === strB);
};
