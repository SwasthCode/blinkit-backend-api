// ORD-20260129-482913
export function generateOrderId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${date}-${random}`;
}

