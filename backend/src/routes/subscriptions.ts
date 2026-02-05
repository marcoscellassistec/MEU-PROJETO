import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const subscriptionRouter = Router();
subscriptionRouter.use(authenticate);

// Get current subscription
subscriptionRouter.get('/current', async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.userId },
      include: { plan: true },
    });

    if (!subscription) {
      res.json({ status: 'none', plan: null });
      return;
    }

    // Check if expired
    if (new Date() > subscription.endDate && subscription.status !== 'EXPIRED') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
      subscription.status = 'EXPIRED';
    }

    res.json(subscription);
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

// Get available plans
subscriptionRouter.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });
    res.json(plans);
  } catch (err) {
    console.error('List plans error:', err);
    res.status(500).json({ error: 'Erro ao listar planos' });
  }
});

// Subscribe to a plan (after payment)
subscriptionRouter.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { planId, isAnnual = false } = req.body;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      res.status(404).json({ error: 'Plano não encontrado' });
      return;
    }

    const endDate = new Date();
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user!.userId },
      update: {
        planId,
        status: 'ACTIVE',
        isAnnual,
        endDate,
        startDate: new Date(),
      },
      create: {
        userId: req.user!.userId,
        planId,
        status: 'ACTIVE',
        isAnnual,
        endDate,
      },
      include: { plan: true },
    });

    res.json(subscription);
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Erro ao assinar plano' });
  }
});

// Cancel subscription
subscriptionRouter.post('/cancel', async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Assinatura não encontrada' });
      return;
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED', autoRenew: false },
    });

    res.json({ message: 'Assinatura cancelada. Acesso até ' + subscription.endDate.toLocaleDateString('pt-BR') });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ error: 'Erro ao cancelar assinatura' });
  }
});
