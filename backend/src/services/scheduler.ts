import { CronJob } from 'cron';
import { prisma } from '../lib/prisma';
import { sendPushNotification } from './notifications';

export function startBillScheduler() {
  // Run every day at 8:00 AM
  const billCheckJob = new CronJob('0 8 * * *', async () => {
    console.log('Running bill check scheduler...');
    await checkUpcomingBills();
    await checkOverdueBills();
    await checkExpiringSubscriptions();
  });

  billCheckJob.start();
  console.log('Bill scheduler started');
}

async function checkUpcomingBills() {
  try {
    const now = new Date();

    // Find bills where notification should be sent
    const bills = await prisma.bill.findMany({
      where: {
        status: 'PENDING',
        isPaid: false,
      },
      include: {
        user: { select: { pushToken: true, name: true } },
      },
    });

    for (const bill of bills) {
      const daysUntilDue = Math.ceil(
        (bill.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDue <= bill.notifyDays && daysUntilDue >= 0 && bill.user.pushToken) {
        await sendPushNotification(bill.user.pushToken, {
          title: 'Conta a vencer!',
          body: `${bill.name} vence ${daysUntilDue === 0 ? 'hoje' : `em ${daysUntilDue} dia(s)`} - R$ ${bill.amount.toFixed(2)}`,
          data: { type: 'bill_reminder', billId: bill.id },
        });
      }
    }
  } catch (err) {
    console.error('Check upcoming bills error:', err);
  }
}

async function checkOverdueBills() {
  try {
    const now = new Date();

    await prisma.bill.updateMany({
      where: {
        status: 'PENDING',
        isPaid: false,
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });

    // Notify overdue
    const overdueBills = await prisma.bill.findMany({
      where: { status: 'OVERDUE' },
      include: { user: { select: { pushToken: true } } },
    });

    for (const bill of overdueBills) {
      if (bill.user.pushToken) {
        await sendPushNotification(bill.user.pushToken, {
          title: 'Conta vencida!',
          body: `${bill.name} está vencida - R$ ${bill.amount.toFixed(2)}`,
          data: { type: 'bill_overdue', billId: bill.id },
        });
      }
    }
  } catch (err) {
    console.error('Check overdue bills error:', err);
  }
}

async function checkExpiringSubscriptions() {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiring = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        endDate: { lte: threeDaysFromNow },
      },
      include: { user: { select: { pushToken: true, name: true } }, plan: true },
    });

    for (const sub of expiring) {
      if (sub.user.pushToken) {
        const daysLeft = Math.ceil(
          (sub.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        await sendPushNotification(sub.user.pushToken, {
          title: sub.status === 'TRIAL' ? 'Trial expirando!' : 'Assinatura expirando!',
          body: `Sua ${sub.status === 'TRIAL' ? 'avaliação gratuita' : 'assinatura'} expira em ${daysLeft} dia(s). Renove para continuar usando!`,
          data: { type: 'subscription_expiring' },
        });
      }
    }
  } catch (err) {
    console.error('Check expiring subscriptions error:', err);
  }
}
