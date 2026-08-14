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
    info: {
      title: 'PaisaInMinutes Backend API',
      version: '1.0.0',
      description: 'API Documentation for PaisaInMinutes Loan Aggregation, Credit Score & Financial Services Platform'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local Development Server' },
      { url: '/', description: 'Current Host Server' }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication & OTP endpoints' },
      { name: 'Users', description: 'User profile management' },
      { name: 'KYC', description: 'PAN & Aadhaar KYC verification' },
      { name: 'Loans', description: 'Loan application management' },
      { name: 'Lenders', description: 'Multi-lender interest rate comparison' },
      { name: 'Credit', description: 'Credit score report & factors' },
      { name: 'Documents', description: 'Document vault & upload' },
      { name: 'System', description: 'Health check and monitoring' }
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Health Check Endpoint',
          responses: {
            200: { description: 'Server is healthy', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' } } } } } }
          }
        }
      },
      '/api/auth/send-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Send OTP to mobile number',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { phone: { type: 'string', example: '9876543210' } }, required: ['phone'] } } }
          },
          responses: {
            200: { description: 'OTP sent successfully' },
            400: { description: 'Validation error' },
            429: { description: 'Too many requests' }
          }
        }
      },
      '/api/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify OTP code and retrieve JWT token',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { phone: { type: 'string', example: '9876543210' }, code: { type: 'string', example: '1234' } }, required: ['phone', 'code'] } } }
          },
          responses: {
            200: { description: 'Authentication successful, returns JWT token & refreshToken' },
            400: { description: 'Invalid or expired OTP' }
          }
        }
      },
      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh JWT token',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } }
          },
          responses: {
            200: { description: 'New JWT token generated' },
            401: { description: 'Invalid or revoked refresh token' }
          }
        }
      },
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User profile object' }, 401: { description: 'Unauthorized' } }
        },
        patch: {
          tags: ['Users'],
          summary: 'Update current user profile (name, email, pan)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, pan: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Updated profile' } }
        }
      },
      '/api/kyc/verify-pan': {
        post: {
          tags: ['KYC'],
          summary: 'Verify PAN Card details',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { pan: { type: 'string', example: 'ABCDE1234F' } } } } }
          },
          responses: { 200: { description: 'PAN verification result' } }
        }
      },
      '/api/kyc/verify-aadhaar-otp': {
        post: {
          tags: ['KYC'],
          summary: 'Verify Aadhaar OTP',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { aadhaar: { type: 'string' }, otp: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Aadhaar verification result' } }
        }
      },
      '/api/loan-applications': {
        post: {
          tags: ['Loans'],
          summary: 'Create a new loan application',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { amount: { type: 'number', example: 100000 }, tenureMonths: { type: 'number', example: 12 }, purpose: { type: 'string' }, monthlyIncome: { type: 'number' } } } } }
          },
          responses: { 200: { description: 'Loan application created' } }
        }
      },
      '/api/loan-applications/my': {
        get: {
          tags: ['Loans'],
          summary: 'Get all loan applications for current user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Array of loan applications' } }
        }
      },
      '/api/lenders': {
        get: {
          tags: ['Lenders'],
          summary: 'List available lending partners and rate comparisons',
          responses: { 200: { description: 'Array of active lenders' } }
        }
      },
      '/api/credit-score': {
        get: {
          tags: ['Credit'],
          summary: 'Get credit score report and key factors',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Credit score report object' } }
        }
      },
      '/api/documents': {
        get: {
          tags: ['Documents'],
          summary: 'List user uploaded documents',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Array of documents' } }
        }
      },
      '/api/documents/upload': {
        post: {
          tags: ['Documents'],
          summary: 'Upload document (KYC/Income proof)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } }
          },
          responses: { 200: { description: 'Uploaded document details' } }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
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

app.get('/', (req, res) => res.redirect('/api/docs'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

module.exports = app;
