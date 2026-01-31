// ORD-20260129-482913
export function generateOrderId(refDate?: Date) {
  const date = (refDate || new Date())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${date}-${random}`;
}

export function generateProductId(refDate?: Date) {
  const date = (refDate || new Date())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PRD-${date}-${random}`;
}
