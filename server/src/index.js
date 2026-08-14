require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const promClient = require('prom-client');
const winston = require('winston');
const apiLimiter = require('./middleware/rateLimit');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const lendersRouter = require('./routes/lenders');
const loansRouter = require('./routes/loans');
const documentsRouter = require('./routes/documents');
const kycRouter = require('./routes/kyc');
const creditRouter = require('./routes/credit');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// apply rate limiter globally
app.use(apiLimiter);

// logging via winston (console)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console()]
});
app.logger = logger;

const uploadDir = process.env.FILES_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: { title: 'Paisa API', version: '0.1.0' }
  },
  apis: ['./src/routes/*.js']
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/lenders', lendersRouter);
app.use('/api/loan-applications', loansRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/credit-score', creditRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

module.exports = app;
