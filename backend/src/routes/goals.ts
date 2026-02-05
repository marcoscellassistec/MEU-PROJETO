import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const goalRouter = Router();
goalRouter.use(authenticate);

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  targetAmount: z.number().positive('Valor alvo deve ser positivo'),
  deadline: z.string().optional(),
  icon: z.string().default('target'),
  color: z.string().default('#6C63FF'),
});

goalRouter.get('/', async (req: Request, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    console.error('List goals error:', err);
    res.status(500).json({ error: 'Erro ao listar metas' });
  }
});

goalRouter.post('/', validate(goalSchema), async (req: Request, res: Response) => {
  try {
    const { name, targetAmount, deadline, icon, color } = req.body;
    const goal = await prisma.goal.create({
      data: {
        name,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
        icon,
        color,
        userId: req.user!.userId,
      },
    });
    res.status(201).json(goal);
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

goalRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Meta não encontrada' });
      return;
    }

    const { name, targetAmount, currentAmount, deadline, icon, color } = req.body;
    const updatedGoal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(targetAmount !== undefined && { targetAmount }),
        ...(currentAmount !== undefined && { currentAmount }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(icon && { icon }),
        ...(color && { color }),
      },
    });

    // Check if goal is completed
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount && !updatedGoal.isCompleted) {
      await prisma.goal.update({
        where: { id: req.params.id },
        data: { isCompleted: true },
      });
    }

    res.json(updatedGoal);
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
});

// Add money to goal
goalRouter.post('/:id/deposit', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valor deve ser positivo' });
      return;
    }

    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Meta não encontrada' });
      return;
    }

    const newAmount = existing.currentAmount + amount;
    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        currentAmount: newAmount,
        isCompleted: newAmount >= existing.targetAmount,
      },
    });

    res.json(goal);
  } catch (err) {
    console.error('Deposit goal error:', err);
    res.status(500).json({ error: 'Erro ao depositar na meta' });
  }
});

goalRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Meta não encontrada' });
      return;
    }

    await prisma.goal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Meta excluída' });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ error: 'Erro ao excluir meta' });
  }
});
