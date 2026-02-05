import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const transactionRouter = Router();
transactionRouter.use(authenticate);

const transactionSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().optional(),
  categoryId: z.string().uuid('Categoria inválida'),
});

// List with filters
transactionRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { type, categoryId, startDate, endDate, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { userId: req.user!.userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate as string) }),
        ...(endDate && { lte: new Date(endDate as string) }),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ transactions, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('List transactions error:', err);
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
});

// Summary (for dashboard)
transactionRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = transactions.reduce((acc: Record<string, { name: string; total: number; color: string; icon: string }>, t) => {
      const key = t.categoryId;
      if (!acc[key]) {
        acc[key] = { name: t.category.name, total: 0, color: t.category.color, icon: t.category.icon };
      }
      acc[key].total += t.amount;
      return acc;
    }, {});

    res.json({
      income,
      expense,
      balance: income - expense,
      byCategory: Object.values(byCategory),
      transactionCount: transactions.length,
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
});

// Monthly chart data
transactionRouter.get('/chart', async (req: Request, res: Response) => {
  try {
    const { months = '6' } = req.query;
    const numMonths = Number(months);
    const now = new Date();
    const data = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: req.user!.userId,
          date: { gte: start, lte: end },
        },
      });

      const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

      data.push({
        month: start.toLocaleString('pt-BR', { month: 'short' }),
        year: start.getFullYear(),
        income,
        expense,
        balance: income - expense,
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Chart error:', err);
    res.status(500).json({ error: 'Erro ao gerar dados do gráfico' });
  }
});

// Create
transactionRouter.post('/', validate(transactionSchema), async (req: Request, res: Response) => {
  try {
    const { amount, type, description, date, categoryId } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        date: date ? new Date(date) : new Date(),
        categoryId,
        userId: req.user!.userId,
      },
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Update
transactionRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    const { amount, type, description, date, categoryId } = req.body;
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(type && { type }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true },
    });
    res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// Delete
transactionRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Transação não encontrada' });
      return;
    }

    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.json({ message: 'Transação excluída' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
});
