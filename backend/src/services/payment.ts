import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

interface PaymentParams {
  amount: number;
  userId: string;
  planId: string;
  isAnnual: boolean;
  description: string;
  email?: string;
}

export async function createPixPayment(params: PaymentParams) {
  const { amount, userId, planId, isAnnual, description } = params;

  const pixKey = process.env.PIX_KEY || '';
  const receiverName = process.env.PIX_RECEIVER_NAME || 'Financas App';
  const city = process.env.PIX_CITY || 'SAO PAULO';
  const txId = uuidv4().replace(/-/g, '').substring(0, 25);

  // Generate Pix copy-paste code (EMV format)
  const pixCode = generatePixCode({
    key: pixKey,
    receiverName,
    city,
    amount,
    txId,
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      method: 'PIX',
      status: 'pending',
      pixCode,
      pixQrCode: pixCode, // In production, generate actual QR code image
      metadata: { planId, isAnnual: String(isAnnual), txId },
    },
  });

  return {
    paymentId: payment.id,
    pixCode,
    pixQrCode: pixCode,
    amount,
    description,
    expiresIn: '30 minutos',
  };
}

export async function createMercadoPagoPayment(params: PaymentParams) {
  const { amount, userId, planId, isAnnual, description, email } = params;

  // In production, use mercadopago SDK:
  // const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
  // const preference = await new Preference(mp).create({ ... });

  const externalId = `mp_${uuidv4()}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      method: 'MERCADOPAGO',
      status: 'pending',
      externalId,
      metadata: { planId, isAnnual: String(isAnnual), email: email || '' },
    },
  });

  // Simulated response - replace with actual Mercado Pago SDK integration
  return {
    paymentId: payment.id,
    externalId,
    initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?preference=${externalId}`,
    amount,
    description,
  };
}

function generatePixCode(params: {
  key: string;
  receiverName: string;
  city: string;
  amount: number;
  txId: string;
}): string {
  const { key, receiverName, city, amount, txId } = params;

  // Simplified EMV Pix code generation
  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const gui = formatField('00', 'br.gov.bcb.pix');
  const pixKey = formatField('01', key);
  const merchantAccount = formatField('26', gui + pixKey);

  const mcc = formatField('52', '0000');
  const currency = formatField('53', '986'); // BRL
  const amountField = formatField('54', amount.toFixed(2));
  const country = formatField('58', 'BR');
  const name = formatField('59', receiverName.substring(0, 25));
  const cityField = formatField('60', city.substring(0, 15));
  const txIdField = formatField('05', txId);
  const additionalData = formatField('62', txIdField);

  const payload = formatField('00', '01') + merchantAccount + mcc + currency + amountField +
    country + name + cityField + additionalData;

  // CRC16 placeholder - in production use proper CRC16-CCITT
  const crc = formatField('63', '0000');

  return payload + crc;
}
