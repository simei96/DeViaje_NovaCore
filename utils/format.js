export const formatCordoba = (value) => {
  const num = Number(value || 0);
  return 'C$ ' + num.toLocaleString('es-NI');
};
