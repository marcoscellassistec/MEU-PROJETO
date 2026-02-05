import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, generateToken, generateRefreshToken } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

authRouter.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Create default categories for new user
    const defaultCategories = [
      { name: 'Salário', icon: 'briefcase', color: '#4CAF50', type: 'INCOME' as const },
      { name: 'Freelance', icon: 'laptop', color: '#2196F3', type: 'INCOME' as const },
      { name: 'Investimentos', icon: 'trending-up', color: '#9C27B0', type: 'INCOME' as const },
      { name: 'Outros', icon: 'plus-circle', color: '#607D8B', type: 'INCOME' as const },
      { name: 'Alimentação', icon: 'coffee', color: '#FF9800', type: 'EXPENSE' as const },
      { name: 'Transporte', icon: 'navigation', color: '#F44336', type: 'EXPENSE' as const },
      { name: 'Moradia', icon: 'home', color: '#795548', type: 'EXPENSE' as const },
      { name: 'Saúde', icon: 'heart', color: '#E91E63', type: 'EXPENSE' as const },
      { name: 'Educação', icon: 'book', color: '#3F51B5', type: 'EXPENSE' as const },
      { name: 'Lazer', icon: 'film', color: '#FF5722', type: 'EXPENSE' as const },
      { name: 'Compras', icon: 'shopping-bag', color: '#FFC107', type: 'EXPENSE' as const },
      { name: 'Contas', icon: 'file-text', color: '#9E9E9E', type: 'EXPENSE' as const },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map(c => ({ ...c, userId: user.id, isDefault: true })),
    });

    // Create trial subscription
    const plan = await prisma.plan.findFirst({ where: { isActive: true } });
    if (plan) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + plan.trialDays);
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'TRIAL',
          endDate: trialEnd,
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({ user, token, refreshToken });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: { include: { plan: true } } },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const { passwordHash: _, ...userData } = user;
    res.json({ user: userData, token, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, name: true, email: true, role: true, avatarUrl: true,
        createdAt: true, subscription: { include: { plan: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

authRouter.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, pushToken } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(name && { name }), ...(pushToken !== undefined && { pushToken }) },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});
