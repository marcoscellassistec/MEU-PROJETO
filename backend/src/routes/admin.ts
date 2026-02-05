import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

// Dashboard stats
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalUsers, activeSubscriptions, totalRevenue, recentPayments] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.subscription.count({ where: { status: { in: ['ACTIVE', 'TRIAL'] } } }),
      prisma.payment.aggregate({
        where: { status: 'approved' },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const trialUsers = await prisma.subscription.count({ where: { status: 'TRIAL' } });
    const expiredUsers = await prisma.subscription.count({ where: { status: 'EXPIRED' } });

    res.json({
      totalUsers,
      activeSubscriptions,
      trialUsers,
      expiredUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentPayments,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// List users
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { role: 'USER' };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, isActive: true, createdAt: true,
          subscription: { include: { plan: true } },
          _count: { select: { transactions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Toggle user active
adminRouter.patch('/users/:id/toggle', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('Toggle user error:', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Plans CRUD
adminRouter.get('/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { subscriptions: true } } },
    });
    res.json(plans);
  } catch (err) {
    console.error('Admin plans error:', err);
    res.status(500).json({ error: 'Erro ao listar planos' });
  }
});

adminRouter.post('/plans', async (req: Request, res: Response) => {
  try {
    const { name, description, monthlyPrice, annualPrice, annualDiscount, features, trialDays } = req.body;
    const plan = await prisma.plan.create({
      data: { name, description, monthlyPrice, annualPrice, annualDiscount, features, trialDays },
    });
    res.status(201).json(plan);
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
});

adminRouter.put('/plans/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, monthlyPrice, annualPrice, annualDiscount, features, trialDays, isActive } = req.body;
    const plan = await prisma.plan.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(monthlyPrice !== undefined && { monthlyPrice }),
        ...(annualPrice !== undefined && { annualPrice }),
        ...(annualDiscount !== undefined && { annualDiscount }),
        ...(features && { features }),
        ...(trialDays !== undefined && { trialDays }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(plan);
  } catch (err) {
    console.error('Update plan error:', err);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
});

// App Config
adminRouter.get('/config', async (_req: Request, res: Response) => {
  try {
    const configs = await prisma.appConfig.findMany();
    const configMap = configs.reduce((acc: Record<string, unknown>, c) => {
      acc[c.key] = c.value;
      return acc;
    }, {});
    res.json(configMap);
  } catch (err) {
    console.error('Admin config error:', err);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

adminRouter.put('/config/:key', async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    const config = await prisma.appConfig.upsert({
      where: { key: req.params.key },
      update: { value },
      create: { key: req.params.key, value },
    });
    res.json(config);
  } catch (err) {
    console.error('Update config error:', err);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

// Payment management
adminRouter.get('/payments', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ payments, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('Admin payments error:', err);
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});

// Manually approve payment
adminRouter.patch('/payments/:id/approve', async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) {
      res.status(404).json({ error: 'Pagamento não encontrado' });
      return;
    }

    await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: 'approved' },
    });

    // Activate subscription
    const metadata = payment.metadata as Record<string, string> | null;
    if (metadata?.planId) {
      const endDate = new Date();
      const isAnnual = metadata.isAnnual === 'true';
      if (isAnnual) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: { planId: metadata.planId, status: 'ACTIVE', isAnnual, endDate, startDate: new Date() },
        create: { userId: payment.userId, planId: metadata.planId, status: 'ACTIVE', isAnnual, endDate },
      });
    }

    res.json({ message: 'Pagamento aprovado e assinatura ativada' });
  } catch (err) {
    console.error('Approve payment error:', err);
    res.status(500).json({ error: 'Erro ao aprovar pagamento' });
  }
});
