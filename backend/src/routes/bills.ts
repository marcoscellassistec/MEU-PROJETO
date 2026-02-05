import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const billRouter = Router();
billRouter.use(authenticate);

const billSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  amount: z.number().positive('Valor deve ser positivo'),
  dueDate: z.string(),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('NONE'),
  categoryId: z.string().uuid().optional(),
  notifyDays: z.number().int().min(0).default(1),
});

billRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where: Record<string, unknown> = { userId: req.user!.userId };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.dueDate = {
        ...(startDate && { gte: new Date(startDate as string) }),
        ...(endDate && { lte: new Date(endDate as string) }),
      };
    }

    const bills = await prisma.bill.findMany({
      where,
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });
    res.json(bills);
  } catch (err) {
    console.error('List bills error:', err);
    res.status(500).json({ error: 'Erro ao listar contas' });
  }
});

// Upcoming bills
billRouter.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bills = await prisma.bill.findMany({
      where: {
        userId: req.user!.userId,
        status: 'PENDING',
        dueDate: { gte: now, lte: nextWeek },
      },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });
    res.json(bills);
  } catch (err) {
    console.error('Upcoming bills error:', err);
    res.status(500).json({ error: 'Erro ao listar contas próximas' });
  }
});

billRouter.post('/', validate(billSchema), async (req: Request, res: Response) => {
  try {
    const { name, amount, dueDate, recurrence, categoryId, notifyDays } = req.body;
    const bill = await prisma.bill.create({
      data: {
        name,
        amount,
        dueDate: new Date(dueDate),
        recurrence,
        categoryId,
        notifyDays,
        userId: req.user!.userId,
      },
      include: { category: true },
    });
    res.status(201).json(bill);
  } catch (err) {
    console.error('Create bill error:', err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

billRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.bill.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    const { name, amount, dueDate, recurrence, categoryId, notifyDays, status } = req.body;
    const bill = await prisma.bill.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(amount !== undefined && { amount }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(recurrence && { recurrence }),
        ...(categoryId !== undefined && { categoryId }),
        ...(notifyDays !== undefined && { notifyDays }),
        ...(status && { status }),
      },
      include: { category: true },
    });
    res.json(bill);
  } catch (err) {
    console.error('Update bill error:', err);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

// Mark as paid
billRouter.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.bill.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    const bill = await prisma.bill.update({
      where: { id: req.params.id },
      data: { status: 'PAID', isPaid: true, paidAt: new Date() },
      include: { category: true },
    });

    // If recurring, create next bill
    if (existing.recurrence !== 'NONE') {
      const nextDate = new Date(existing.dueDate);
      switch (existing.recurrence) {
        case 'DAILY': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'WEEKLY': nextDate.setDate(nextDate.getDate() + 7); break;
        case 'MONTHLY': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'YEARLY': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
      }

      await prisma.bill.create({
        data: {
          name: existing.name,
          amount: existing.amount,
          dueDate: nextDate,
          recurrence: existing.recurrence,
          categoryId: existing.categoryId,
          notifyDays: existing.notifyDays,
          userId: existing.userId,
        },
      });
    }

    res.json(bill);
  } catch (err) {
    console.error('Pay bill error:', err);
    res.status(500).json({ error: 'Erro ao pagar conta' });
  }
});

billRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.bill.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    await prisma.bill.delete({ where: { id: req.params.id } });
    res.json({ message: 'Conta excluída' });
  } catch (err) {
    console.error('Delete bill error:', err);
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
});
