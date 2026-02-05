import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth';
import { transactionRouter } from './routes/transactions';
import { categoryRouter } from './routes/categories';
import { goalRouter } from './routes/goals';
import { billRouter } from './routes/bills';
import { subscriptionRouter } from './routes/subscriptions';
import { paymentRouter } from './routes/payments';
import { adminRouter } from './routes/admin';
import { webhookRouter } from './routes/webhooks';
import { errorHandler } from './middleware/errorHandler';
import { startBillScheduler } from './services/scheduler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/goals', goalRouter);
app.use('/api/bills', billRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

startBillScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
