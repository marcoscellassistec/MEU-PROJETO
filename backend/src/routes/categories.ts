import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const categoryRouter = Router();
categoryRouter.use(authenticate);

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().default('tag'),
  color: z.string().default('#6C63FF'),
  type: z.enum(['INCOME', 'EXPENSE']),
});

categoryRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const where: Record<string, unknown> = {
      OR: [{ userId: req.user!.userId }, { userId: null, isDefault: true }],
    };
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
});

categoryRouter.post('/', validate(categorySchema), async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.create({
      data: { ...req.body, userId: req.user!.userId },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

categoryRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Categoria não encontrada' });
      return;
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(category);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

categoryRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user!.userId, isDefault: false },
    });
    if (!existing) {
      res.status(404).json({ error: 'Categoria não encontrada ou é padrão' });
      return;
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Categoria excluída' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});
