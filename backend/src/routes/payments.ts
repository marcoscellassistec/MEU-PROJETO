import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { createPixPayment, createMercadoPagoPayment } from '../services/payment';

export const paymentRouter = Router();
paymentRouter.use(authenticate);

// Create Pix payment
paymentRouter.post('/pix', async (req: Request, res: Response) => {
  try {
    const { planId, isAnnual = false } = req.body;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      res.status(404).json({ error: 'Plano não encontrado' });
      return;
    }

    const amount = isAnnual ? plan.annualPrice : plan.monthlyPrice;

    const pixData = await createPixPayment({
      amount,
      userId: req.user!.userId,
      planId,
      isAnnual,
      description: `${plan.name} - ${isAnnual ? 'Anual' : 'Mensal'}`,
    });

    res.json(pixData);
  } catch (err) {
    console.error('Pix payment error:', err);
    res.status(500).json({ error: 'Erro ao gerar pagamento Pix' });
  }
});

// Create Mercado Pago payment
paymentRouter.post('/mercadopago', async (req: Request, res: Response) => {
  try {
    const { planId, isAnnual = false } = req.body;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      res.status(404).json({ error: 'Plano não encontrado' });
      return;
    }

    const amount = isAnnual ? plan.annualPrice : plan.monthlyPrice;

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const paymentData = await createMercadoPagoPayment({
      amount,
      userId: req.user!.userId,
      planId,
      isAnnual,
      description: `${plan.name} - ${isAnnual ? 'Anual' : 'Mensal'}`,
      email: user.email,
    });

    res.json(paymentData);
  } catch (err) {
    console.error('MercadoPago payment error:', err);
    res.status(500).json({ error: 'Erro ao criar pagamento Mercado Pago' });
  }
});

// Check payment status
paymentRouter.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });

    if (!payment) {
      res.status(404).json({ error: 'Pagamento não encontrado' });
      return;
    }

    res.json({ status: payment.status, method: payment.method });
  } catch (err) {
    console.error('Payment status error:', err);
    res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
});

// List user payments
paymentRouter.get('/', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (err) {
    console.error('List payments error:', err);
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});
