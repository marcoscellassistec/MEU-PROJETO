import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const webhookRouter = Router();

// Mercado Pago webhook
webhookRouter.post('/mercadopago', async (req: Request, res: Response) => {
  try {
    const { action, data } = req.body;

    if (action === 'payment.updated' || action === 'payment.created') {
      const paymentId = data?.id;
      if (!paymentId) {
        res.status(400).json({ error: 'Payment ID missing' });
        return;
      }

      // Find payment by external ID
      const payment = await prisma.payment.findFirst({
        where: { externalId: String(paymentId) },
      });

      if (payment) {
        // In production, verify with Mercado Pago API
        const newStatus = action === 'payment.updated' ? 'approved' : payment.status;

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        });

        // If approved, activate subscription
        if (newStatus === 'approved') {
          const metadata = payment.metadata as Record<string, string> | null;
          const planId = metadata?.planId;
          const isAnnual = metadata?.isAnnual === 'true';

          if (planId) {
            const endDate = new Date();
            if (isAnnual) {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }

            await prisma.subscription.upsert({
              where: { userId: payment.userId },
              update: {
                planId,
                status: 'ACTIVE',
                isAnnual,
                endDate,
                startDate: new Date(),
              },
              create: {
                userId: payment.userId,
                planId,
                status: 'ACTIVE',
                isAnnual,
                endDate,
              },
            });
          }
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Pix webhook (manual confirmation or bank API)
webhookRouter.post('/pix', async (req: Request, res: Response) => {
  try {
    const { paymentId, status } = req.body;

    if (paymentId && status === 'approved') {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'approved' },
        });

        const metadata = payment.metadata as Record<string, string> | null;
        const planId = metadata?.planId;
        const isAnnual = metadata?.isAnnual === 'true';

        if (planId) {
          const endDate = new Date();
          if (isAnnual) {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await prisma.subscription.upsert({
            where: { userId: payment.userId },
            update: { planId, status: 'ACTIVE', isAnnual, endDate, startDate: new Date() },
            create: { userId: payment.userId, planId, status: 'ACTIVE', isAnnual, endDate },
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Pix webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});
