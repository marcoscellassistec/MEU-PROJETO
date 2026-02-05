import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@financas.app' },
    update: {},
    create: {
      name: 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@financas.app',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', admin.email);

  // Create default plan
  const plan = await prisma.plan.upsert({
    where: { id: 'default-plan' },
    update: {},
    create: {
      id: 'default-plan',
      name: 'Premium',
      description: 'Acesso completo a todas as funcionalidades do app',
      monthlyPrice: 14.90,
      annualPrice: 119.90,
      annualDiscount: 33,
      trialDays: 7,
      features: [
        'Transações ilimitadas',
        'Metas financeiras',
        'Gráficos detalhados',
        'Contas a pagar com lembretes',
        'Push notifications',
        'Relatórios mensais',
        'Categorias personalizadas',
        'Exportar dados',
      ],
    },
  });
  console.log('Plan created:', plan.name);

  // Default app configs
  const configs = [
    { key: 'pix_key', value: JSON.stringify('') },
    { key: 'pix_receiver_name', value: JSON.stringify('Financas App') },
    { key: 'pix_city', value: JSON.stringify('SAO PAULO') },
    { key: 'mercadopago_enabled', value: JSON.stringify(true) },
    { key: 'pix_enabled', value: JSON.stringify(true) },
    { key: 'app_name', value: JSON.stringify('Finanças App') },
    { key: 'support_email', value: JSON.stringify('suporte@financas.app') },
  ];

  for (const config of configs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log('App configs created');

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
