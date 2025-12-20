/**
 * Country-specific terminology for financial documents
 * Maps country codes to the appropriate terms used in each region
 */

export interface FinancialTerms {
  // Singular forms
  factura: string;        // Invoice
  boleta: string;         // Receipt/ticket
  transferencia: string;  // Transfer
  
  // Plural forms
  facturas: string;
  boletas: string;
  transferencias: string;
  
  // Combined terms
  facturasYBoletas: string;  // "Facturas y Boletas" or equivalent
  documentos: string;        // Generic term for documents
}

// Default Spanish terms (used as fallback)
const DEFAULT_TERMS: FinancialTerms = {
  factura: 'factura',
  boleta: 'recibo',
  transferencia: 'transferencia',
  facturas: 'facturas',
  boletas: 'recibos',
  transferencias: 'transferencias',
  facturasYBoletas: 'Facturas y Recibos',
  documentos: 'documentos',
};

// Country-specific terminology
const COUNTRY_TERMS: Record<string, FinancialTerms> = {
  // Chile - uses boleta and factura
  CL: {
    factura: 'factura',
    boleta: 'boleta',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'boletas',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Boletas',
    documentos: 'documentos',
  },
  
  // Argentina - uses factura and ticket
  AR: {
    factura: 'factura',
    boleta: 'ticket',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'tickets',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Tickets',
    documentos: 'comprobantes',
  },
  
  // Mexico - uses factura and ticket/recibo
  MX: {
    factura: 'factura',
    boleta: 'ticket',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'tickets',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Tickets',
    documentos: 'comprobantes',
  },
  
  // Colombia - uses factura and recibo
  CO: {
    factura: 'factura',
    boleta: 'recibo',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'recibos',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Recibos',
    documentos: 'comprobantes',
  },
  
  // Peru - uses factura and boleta (similar to Chile)
  PE: {
    factura: 'factura',
    boleta: 'boleta',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'boletas',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Boletas',
    documentos: 'comprobantes',
  },
  
  // Venezuela - uses factura and recibo
  VE: {
    factura: 'factura',
    boleta: 'recibo',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'recibos',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Recibos',
    documentos: 'comprobantes',
  },
  
  // Ecuador - uses factura and recibo/nota de venta
  EC: {
    factura: 'factura',
    boleta: 'nota de venta',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'notas de venta',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Notas de Venta',
    documentos: 'comprobantes',
  },
  
  // Bolivia - uses factura and recibo
  BO: {
    factura: 'factura',
    boleta: 'recibo',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'recibos',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Recibos',
    documentos: 'comprobantes',
  },
  
  // Paraguay - uses factura and ticket
  PY: {
    factura: 'factura',
    boleta: 'ticket',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'tickets',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Tickets',
    documentos: 'comprobantes',
  },
  
  // Uruguay - uses factura and ticket
  UY: {
    factura: 'factura',
    boleta: 'ticket',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'tickets',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Tickets',
    documentos: 'comprobantes',
  },
  
  // Spain - uses factura and ticket/recibo
  ES: {
    factura: 'factura',
    boleta: 'ticket',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'tickets',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Tickets',
    documentos: 'comprobantes',
  },
  
  // United States (Spanish speakers) - uses factura and recibo
  US: {
    factura: 'factura',
    boleta: 'recibo',
    transferencia: 'transferencia',
    facturas: 'facturas',
    boletas: 'recibos',
    transferencias: 'transferencias',
    facturasYBoletas: 'Facturas y Recibos',
    documentos: 'comprobantes',
  },
  
  // Brazil - Portuguese terms
  BR: {
    factura: 'nota fiscal',
    boleta: 'recibo',
    transferencia: 'transferência',
    facturas: 'notas fiscais',
    boletas: 'recibos',
    transferencias: 'transferências',
    facturasYBoletas: 'Notas Fiscais e Recibos',
    documentos: 'comprovantes',
  },
};

/**
 * Get financial terminology for a specific country
 */
export function getTermsForCountry(countryCode: string): FinancialTerms {
  const upperCode = countryCode?.toUpperCase() || '';
  return COUNTRY_TERMS[upperCode] || DEFAULT_TERMS;
}

/**
 * Get a specific term for a country
 */
export function getTerm(countryCode: string, term: keyof FinancialTerms): string {
  const terms = getTermsForCountry(countryCode);
  return terms[term];
}

/**
 * Get all supported country codes
 */
export function getSupportedCountries(): string[] {
  return Object.keys(COUNTRY_TERMS);
}
