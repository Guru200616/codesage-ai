import { AnalysisResult } from "./types";

export const PRELOADED_REPOS: Record<string, AnalysisResult> = {
  "express-auth-stripe": {
    repository: {
      id: "express-auth-stripe",
      name: "express-auth-stripe",
      owner: "codesage-labs",
      url: "https://github.com/codesage-labs/express-auth-stripe",
      description: "Secure Express.js REST API with JWT Auth, PostgreSQL migrations, Stripe payment webhooks, and rate limiting",
      stars: 1248,
      forks: 342,
      languages: [
        { name: "TypeScript", percentage: 82.5 },
        { name: "JavaScript", percentage: 12.0 },
        { name: "SQL", percentage: 5.5 }
      ],
      mainLanguage: "TypeScript",
      framework: "Express / Node.js",
      healthScore: 68,
      findingsCount: { critical: 1, high: 2, medium: 3, low: 4 },
      docCoverage: 85,
      testCoverage: 72,
      maintainabilityIndex: 78
    },
    files: [
      {
        path: "package.json",
        name: "package.json",
        type: "file",
        size: 1420,
        content: `{
  "name": "express-auth-stripe",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn src/server.ts",
    "migrate": "knex migrate:latest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "stripe": "^12.0.0",
    "bcryptjs": "^2.4.3",
    "pg": "^8.11.0",
    "express-rate-limit": "^6.7.0"
  }
}`
      },
      {
        path: "src/server.ts",
        name: "server.ts",
        type: "file",
        size: 2150,
        content: `import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { authRouter } from './controllers/authController';
import { paymentRouter } from './controllers/paymentController';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP.'
});

app.use(cors());
app.use(limiter);

// Stripe Webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/payments', paymentRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});`
      },
      {
        path: "src/middleware/auth.ts",
        name: "auth.ts",
        type: "file",
        size: 1100,
        content: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Auth token required' });
  }

  // WARNING: Weak default secret fallback (SECURITY FINDING MEDIUM)
  const secret = process.env.JWT_SECRET || 'SUPER_SECRET_DEFAULT_KEY_12345';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.user = decoded as AuthRequest['user'];
    next();
  });
};`
      },
      {
        path: "src/controllers/authController.ts",
        name: "authController.ts",
        type: "file",
        size: 2800,
        content: `import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // SECURITY RISK HIGH: SQL Injection Vulnerability due to raw string interpolation
    const query = \`INSERT INTO users (email, password) VALUES ('\${email}', '\${hashedPassword}') RETURNING id, email\`;
    const result = await db.query(query);
    
    res.status(201).json({ user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET || 'SUPER_SECRET_DEFAULT_KEY_12345',
    { expiresIn: '2h' }
  );

  res.json({ token, user: { id: user.id, email: user.email } });
});`
      },
      {
        path: "src/controllers/paymentController.ts",
        name: "paymentController.ts",
        type: "file",
        size: 3400,
        content: `import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { stripe } from '../services/stripeService';
import { db } from '../db/connection';

export const paymentRouter = Router();

// CODE SMELL: Exposes large block, complex DB queries inside controller (SOLID Violation)
paymentRouter.post('/subscribe', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { priceId } = req.body;
  const userId = req.user?.id;

  if (!priceId) {
    return res.status(400).json({ error: 'Price ID is required' });
  }

  try {
    const userQuery = await db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
    let customerId = userQuery.rows[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user?.email,
        metadata: { userId: userId || '' }
      });
      customerId = customer.id;
      await db.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      billing_address_collection: 'auto',
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: \`\${process.env.APP_URL}/dashboard?status=success\`,
      cancel_url: \`\${process.env.APP_URL}/pricing?status=canceled\`
    });

    res.json({ sessionUrl: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});`
      },
      {
        path: "src/services/stripeService.ts",
        name: "stripeService.ts",
        type: "file",
        size: 950,
        content: `import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe services will fail.');
}

// SECURITY RISK LOW: Weak initializer check
export const stripe = new Stripe(apiKey || 'mock_stripe_key_v1', {
  apiVersion: '2022-11-15',
});`
      },
      {
        path: "src/db/connection.ts",
        name: "connection.ts",
        type: "file",
        size: 850,
        content: `import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const db = {
  query: async (text: string, params?: any[]) => {
    // Safety check for empty or mock configuration
    if (!connectionString) {
      console.log(\`[MOCK WORKFLOW] Executing Query: \${text}\`);
      // Simulating realistic responses
      if (text.includes('SELECT * FROM users')) {
        return { rows: [{ id: 'u_100', email: 'user@example.com', password: '$2a$10$hashed', role: 'admin' }] };
      }
      return { rows: [{ id: 'u_' + Math.floor(Math.random()*1000), email: 'new@example.com' }] };
    }
    
    const pool = new Pool({ connectionString });
    try {
      return await pool.query(text, params);
    } finally {
      await pool.end();
    }
  }
};`
      }
    ],
    vulnerabilities: [
      {
        id: "VULN-001",
        title: "SQL Injection in User Registration",
        severity: "critical",
        category: "SQL Injection",
        file: "src/controllers/authController.ts",
        line: 18,
        description: "Direct string interpolation of untrusted user-supplied parameter `email` into SQL query string bypasses static preparation. Attackers can escape quotes and injection arbitrary malicious SQL command sequences (such as reading system databases, elevating privileges, or dropping system tables).",
        remediation: "Use parameterized queries (prepared statements) instead of template literal interpolation. The database driver safely escapes variable inputs.",
        codeSnippet: `// ❌ VULNERABLE:
const query = \`INSERT INTO users (email, password) VALUES ('\${email}', '\${hashedPassword}') RETURNING id, email\`;
const result = await db.query(query);

// ✅ SECURE REMEDIATION:
const query = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email';
const result = await db.query(query, [email, hashedPassword]);`
      },
      {
        id: "VULN-002",
        title: "Weak Hardcoded JWT Fallback Key",
        severity: "high",
        category: "Hardcoded Secrets",
        file: "src/middleware/auth.ts",
        line: 16,
        description: "Hardcoded default fallback string 'SUPER_SECRET_DEFAULT_KEY_12345' is assigned when process.env.JWT_SECRET is undefined. Anyone can craft a arbitrary JWT using the signature of this widely known public secret fallback to gain unauthorized root-access claims across all accounts.",
        remediation: "Avoid providing default string secrets in the source code. Enforce strict configuration assertion at application startup. If a required secret is missing, throw an error immediately during boot and fail-fast.",
        codeSnippet: `// ❌ VULNERABLE:
const secret = process.env.JWT_SECRET || 'SUPER_SECRET_DEFAULT_KEY_12345';

// ✅ SECURE REMEDIATION:
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is required.');
}`
      },
      {
        id: "VULN-003",
        title: "Missing CSRF Protection",
        severity: "medium",
        category: "CSRF",
        file: "src/server.ts",
        line: 25,
        description: "Express backend lacks anti-cross-site request forgery protection (CSRF) middleware for subscription payments. Attackers can trick authenticated users into triggering subscription creation silently via sub-domain image requests.",
        remediation: "Implement custom CSRF token middleware or utilize helmet, SameSite=Strict cookie constraints, and secure custom verification header protocols (such as double-submit cookie pattern) on all mutation requests.",
        codeSnippet: `// ✅ SECURE REMEDIATION:
import doubleCsrf from 'double-csrf'; // configure double csrf tokens to protect post routes`
      }
    ],
    codeSmells: [
      {
        id: "SMELL-001",
        title: "Large Controller Mixing Webhooks and DB Queries",
        severity: "high",
        file: "src/controllers/paymentController.ts",
        line: 10,
        description: "The payment subscribe endpoint violates SOLID Single Responsibility Principle by combining Stripe payload creation, database lookup, customer registration orchestration, and return statement formulation inside a single nested controller function.",
        recommendation: "Refactor database updates and client-creation triggers out of the route controller into a dedicated StripeSubscriptionService class.",
        rule: "SOLID: Single Responsibility Principle"
      },
      {
        id: "SMELL-002",
        title: "Tightly Coupled Direct DB Module Import",
        severity: "medium",
        file: "src/controllers/authController.ts",
        line: 4,
        description: "The authentication routes directly reference Knex/PG db module connections. This couples the controller directly to the SQL dialect, stopping mock abstraction in automated tests.",
        recommendation: "Create an AuthRepository layer utilizing clean interface injection patterns.",
        rule: "Architecture: Tight Coupling"
      }
    ],
    dependencyGraph: {
      nodes: [
        { id: "server", label: "src/server.ts", type: "route", file: "src/server.ts" },
        { id: "authMiddleware", label: "src/middleware/auth.ts", type: "utility", file: "src/middleware/auth.ts" },
        { id: "authController", label: "src/controllers/authController.ts", type: "controller", file: "src/controllers/authController.ts" },
        { id: "paymentController", label: "src/controllers/paymentController.ts", type: "controller", file: "src/controllers/paymentController.ts" },
        { id: "stripeService", label: "src/services/stripeService.ts", type: "service", file: "src/services/stripeService.ts" },
        { id: "dbConnection", label: "src/db/connection.ts", type: "database", file: "src/db/connection.ts" }
      ],
      edges: [
        { id: "e1", source: "server", target: "authController", label: "routs /api/auth" },
        { id: "e2", source: "server", target: "paymentController", label: "routs /api/payments" },
        { id: "e3", source: "authController", target: "dbConnection", label: "validates / inserts user" },
        { id: "e4", source: "paymentController", target: "authMiddleware", label: "secures route" },
        { id: "e5", source: "paymentController", target: "stripeService", label: "creates subscription" },
        { id: "e6", source: "paymentController", target: "dbConnection", label: "reads / updates customer_id" }
      ]
    },
    documentation: [
      {
        id: "DOC-01",
        category: "readme",
        title: "Introduction & Overview",
        content: `# Express Auth & Stripe Subscription API

This repository contains a high-performance, robust user registration, authentication, and recurring Stripe checkout pipeline built using Node.js, Express, and PostgreSQL.

## Features
- **Stateless Authentication**: Fast, secure JSON Web Token authorization cookies.
- **Durable DB Migrations**: Connection engines writing and asserting structures to Postgres engines.
- **Stripe Subscriptions**: Seamlessly sync subscriptions using Stripe Webhooks.`
      },
      {
        id: "DOC-02",
        category: "api",
        title: "REST API Endpoint Reference",
        content: `### Authentication Endpoints

#### POST \`/api/auth/register\`
Creates standard credentials.
- **Payload**:
  \`\`\`json
  { "email": "dev@codesage.ai", "password": "supersecurepass" }
  \`\`\`
- **Response**: \`201 Created\`

#### POST \`/api/auth/login\`
Generates active JWT credentials.
- **Response**: \`200 OK\` featuring token fields.

### Payments Endpoints

#### POST \`/api/payments/subscribe\`
Creates a checkout link for subscription purchase. (Requires bearer auth).`
      },
      {
        id: "DOC-03",
        category: "setup",
        title: "Developer Setup & Envs",
        content: `### Prerequisites
- Node.js v18 or higher
- PostgreSQL instance running

### Installation Steps
1. Clone the project and install:
   \`\`\`bash
   npm install
   \`\`\`
2. Copy environment sample:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
3. Configure environment keys:
   \`\`\`env
   DATABASE_URL="postgres://postgres:root@localhost:5432/express_stripe"
   STRIPE_SECRET_KEY="sk_test_..."
   JWT_SECRET="secure_random_hash_here"
   \`\`\`
4. Execute tables seeding:
   \`\`\`bash
   npm run migrate
   npm run dev
   \`\`\``
      }
    ],
    testSuites: [
      {
        id: "TEST-01",
        file: "src/tests/auth.test.ts",
        framework: "jest",
        coverage: 88,
        tests: [
          {
            name: "Should register new user successfully with unique email",
            type: "unit",
            code: `describe('Auth Register', () => {
  it('registers successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'john@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
  });
});`
          },
          {
            name: "Should block duplicate email registration",
            type: "edge",
            code: `it('prevents duplicates', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'duplicate@example.com', password: 'password123' });
  expect(res.status).toBe(400);
});`
          }
        ]
      }
    ],
    flowTrace: [
      {
        id: "flow-1",
        label: "Client Request Sub",
        description: "Client submits subscription payload calling POST /api/payments/subscribe with pricing metadata details.",
        file: "src/server.ts",
        step: 1,
        type: "client",
        code: `axios.post('/api/payments/subscribe', { priceId: 'price_premium' }, { headers: { Authorization: 'Bearer x' }})`
      },
      {
        id: "flow-2",
        label: "Auth Token Val",
        description: "Express router forwards headers to auth verification middleware checking JWT validity.",
        file: "src/middleware/auth.ts",
        step: 2,
        type: "controller",
        code: `jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { ... })`
      },
      {
        id: "flow-3",
        label: "Fetch Billing Profile",
        description: "PaymentController executes SQL script evaluating if a stripe customer reference ID already exists for the User ID.",
        file: "src/controllers/paymentController.ts",
        step: 3,
        type: "service",
        code: `db.query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId])`
      },
      {
        id: "flow-4",
        label: "Checkout Sessions",
        description: "Stripe helper initializes creation session and sends back the gateway URL link to client.",
        file: "src/services/stripeService.ts",
        step: 4,
        type: "repository",
        code: `stripe.checkout.sessions.create({ customer: customerId, mode: 'subscription', ... })`
      }
    ]
  },
  "react-nexus-dashboard": {
    repository: {
      id: "react-nexus-dashboard",
      name: "react-nexus-dashboard",
      owner: "codesage-labs",
      url: "https://github.com/codesage-labs/react-nexus-dashboard",
      description: "Modern analytics dashboard built in React 18, utilizing Vite, TailwindCSS container styling, and Framer Motion transitions",
      stars: 842,
      forks: 180,
      languages: [
        { name: "TypeScript", percentage: 91.2 },
        { name: "CSS", percentage: 8.8 }
      ],
      mainLanguage: "TypeScript",
      framework: "React 18 / Tailwind",
      healthScore: 88,
      findingsCount: { critical: 0, high: 1, medium: 2, low: 3 },
      docCoverage: 92,
      testCoverage: 60,
      maintainabilityIndex: 85
    },
    files: [
      {
        path: "src/App.tsx",
        name: "App.tsx",
        type: "file",
        size: 1600,
        content: `import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Grid } from './components/Grid';
import { useAnalytics } from './hooks/useAnalytics';

export default function App() {
  const { metrics, loading } = useAnalytics();
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold">Analytics Nexus</h1>
        {loading ? <p>Loading widgets...</p> : <Grid data={metrics} />}
      </main>
    </div>
  );
}`
      }
    ],
    vulnerabilities: [
      {
        id: "VULN-101",
        title: "Improper DOM dangerouslySetInnerHTML usage",
        severity: "high",
        category: "XSS",
        file: "src/components/Grid.tsx",
        line: 38,
        description: "Raw string interpolation inside a HTML dangerouslySetInnerHTML without sanitizing inputs in customized custom cards renders raw text strings. If users write malicious scripts in names, the browser triggers a client-side execution.",
        remediation: "Include DOMPurify sanitization before feeding raw structural layouts, or use safe text state elements.",
        codeSnippet: `<div dangerouslySetInnerHTML={{ __html: content }} />`
      }
    ],
    codeSmells: [],
    dependencyGraph: {
      nodes: [
        { id: "app", label: "src/App.tsx", type: "module", file: "src/App.tsx" },
        { id: "sidebar", label: "src/components/Sidebar.tsx", type: "controller", file: "src/components/Sidebar.tsx" },
        { id: "grid", label: "src/components/Grid.tsx", type: "controller", file: "src/components/Grid.tsx" }
      ],
      edges: [
        { id: "e1", source: "app", target: "sidebar" },
        { id: "e2", source: "app", target: "grid" }
      ]
    },
    documentation: [
      {
        id: "DOC-10",
        category: "readme",
        title: "React Nexus Overview",
        content: `# React Nexus Analytics Dashboard

A highly performant SPA compiling responsive frames in milliseconds. Built focusing on minimal renders.`
      }
    ],
    testSuites: [],
    flowTrace: []
  },
  "fastapi-spanner-ai": {
    repository: {
      id: "fastapi-spanner-ai",
      name: "fastapi-spanner-ai",
      owner: "codesage-labs",
      url: "https://github.com/codesage-labs/fastapi-spanner-ai",
      description: "Python async REST microservice using FastAPI, executing bulk records directly in Google Cloud Spanner, cached via Redis",
      stars: 940,
      forks: 210,
      languages: [
        { name: "Python", percentage: 95.0 },
        { name: "Dockerfile", percentage: 5.0 }
      ],
      mainLanguage: "Python",
      framework: "FastAPI / Python",
      healthScore: 92,
      findingsCount: { critical: 0, high: 0, medium: 2, low: 5 },
      docCoverage: 95,
      testCoverage: 80,
      maintainabilityIndex: 90
    },
    files: [
      {
        path: "main.py",
        name: "main.py",
        type: "file",
        size: 1540,
        content: `from fastapi import FastAPI, Depends
from db.spanner_config import get_spanner_db
from models.insights import ai_insight

app = FastAPI(title="Spanner AI Engine")

@app.get("/insights/{id}")
async def fetch_insight(id: str, db = Depends(get_spanner_db)):
    record = await db.fetch_record(id)
    return {"insights": ai_insight(record)}`
      }
    ],
    vulnerabilities: [
      {
        id: "VULN-201",
        title: "Improper Server-Side Request Forgery",
        severity: "medium",
        category: "SSRF",
        file: "main.py",
        line: 52,
        description: "The AI parsing engine fetches images of URLs without parsing domain parameters, giving malicious intruders access to retrieve metadata contents from cloud configuration servers.",
        remediation: "Verify domains match a specific allowed hostname blacklist.",
        codeSnippet: `import requests\ndef fetch_url(url):\n    return requests.get(url).content`
      }
    ],
    codeSmells: [],
    dependencyGraph: {
      nodes: [
        { id: "mainPy", label: "main.py", type: "module", file: "main.py" },
        { id: "spannerDb", label: "db/spanner_config.py", type: "database", file: "db/spanner_config.py" }
      ],
      edges: [
        { id: "e1", source: "mainPy", target: "spannerDb" }
      ]
    },
    documentation: [
      {
        id: "DOC-20",
        category: "readme",
        title: "FastAPI Spanner Gateway",
        content: `# FastAPI Spanner AI Engine

Robust Python microservice connecting Spanner schemas directly with background task queues.`
      }
    ],
    testSuites: [],
    flowTrace: []
  }
};
