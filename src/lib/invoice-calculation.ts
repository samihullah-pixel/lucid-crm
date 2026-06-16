export function calculateInvoiceAmounts(netAmount: number, taxRate: number) {
  const taxAmount = Math.round(netAmount * (taxRate / 100) * 100) / 100;
  const grossAmount = Math.round((netAmount + taxAmount) * 100) / 100;
  return { taxAmount, grossAmount };
}
