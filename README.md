# 🚀 CodeSage AI

### Autonomous Code Intelligence Agent

> Understand, Explain, Secure, Review, and Analyze Any GitHub Repository with AI.

CodeSage AI is a production-grade AI-powered Repository Intelligence Platform that helps developers understand complex codebases through natural language interaction. It combines Multi-Agent AI, Retrieval-Augmented Generation (RAG), Knowledge Graphs, Tree-sitter, and Hybrid Retrieval to provide deep repository insights, architecture understanding, security auditing, code reviews, and impact analysis.

---

## 🌟 Features

### 🤖 Repository Chat

Ask questions about any repository in natural language:

```text
How does authentication work?

Where is JWT generated?

How is payment processed?

Which service handles notifications?

What breaks if UserService changes?
```

Get intelligent answers with:

- File References
- Function References
- Execution Flow
- Dependency Context
- Architecture Insights

---

### 🏗️ Architecture Discovery

Automatically identify:

- Project Structure
- Frameworks
- Design Patterns
- Service Relationships
- Layered Architecture
- Repository Components

Example:

```text
Frontend
   ↓
API Layer
   ↓
Service Layer
   ↓
Repository Layer
   ↓
Database
```

---

### 🔍 Dependency Analysis

Generate and visualize:

- Dependency Graphs
- Import Graphs
- Call Graphs
- Knowledge Graphs

Understand how modules, services, and components interact across the repository.

---

### 🔐 Security Analysis

Detect security vulnerabilities including:

- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Server-Side Request Forgery (SSRF)
- Path Traversal
- Command Injection
- Hardcoded Secrets
- Weak JWT Configurations
- Dependency Vulnerabilities
- Missing Authentication

---

### 📊 Code Quality Review

Analyze:

- Maintainability
- Complexity
- Technical Debt
- SOLID Violations
- Circular Dependencies
- Large Functions
- Large Classes
- Architecture Violations

---

### 📖 Documentation Generator

Automatically generate:

- README Files
- Setup Guides
- API Documentation
- Architecture Documentation
- Developer Guides

---

### 🧪 Test Generator

Generate:

- Unit Tests
- Integration Tests
- Edge Cases
- Negative Test Cases

Supported Frameworks:

- Pytest
- Jest
- JUnit

---

### 🔄 Pull Request Review

Analyze Pull Requests for:

- Security Risks
- Breaking Changes
- Code Smells
- Architecture Violations
- Dependency Impact

---

### 🎯 Impact Analysis

Ask:

```text
What breaks if UserService changes?
```

Identify:

- Affected Services
- Affected APIs
- Affected Modules
- Dependency Chain
- Downstream Effects

---

## 🏛️ System Architecture

```text
User
 │
 ▼

React Dashboard
 │
 ▼

FastAPI Backend
 │
 ▼

LangGraph Orchestrator
 │
 ├── Repository Agent
 ├── Indexing Agent
 ├── Summary Agent
 ├── Graph Agent
 ├── Retrieval Agent
 ├── Flow Analysis Agent
 ├── Security Agent
 ├── Review Agent
 ├── Documentation Agent
 ├── Test Generation Agent
 ├── Impact Analysis Agent
 ├── PR Review Agent
 └── Explanation Agent
 │
 ▼

PostgreSQL
Redis
ChromaDB
NetworkX
```

---

## 🧠 Multi-Agent System

### Repository Agent

- Clone repositories
- Detect frameworks
- Detect languages
- Detect architecture patterns
- Generate repository overview

### Indexing Agent

- Parse source code
- Extract classes and functions
- Create semantic chunks
- Generate embeddings

### Summary Agent

Generate:

- File Summaries
- Module Summaries
- Repository Summaries

### Graph Agent

Build:

- Dependency Graphs
- Import Graphs
- Call Graphs
- Knowledge Graphs

### Retrieval Agent

```text
Question
   ↓
BM25 Search
   ↓
Vector Search
   ↓
Cross Encoder Reranking
   ↓
Knowledge Graph Context
   ↓
Repository Summary Context
   ↓
LLM
```

### Flow Analysis Agent

Trace execution paths:

```text
Client
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

### Security Agent

Detect vulnerabilities and generate remediation suggestions.

### Review Agent

Analyze maintainability, complexity, and architecture quality.

### Documentation Agent

Generate project documentation automatically.

### Test Generation Agent

Generate production-ready tests.

### Impact Analysis Agent

Predict change impact across the repository.

### PR Review Agent

Perform automated pull request reviews.

### Explanation Agent

Provide repository-aware answers with context and references.

---

## 🛠️ Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- React Flow
- Recharts
- Zustand

### Backend

- FastAPI
- Python 3.11+

### AI & RAG

- LangGraph
- Gemini 1.5 Flash
- OpenAI GPT (Optional)
- BGE-large-en-v1.5
- ChromaDB
- BM25 Retrieval
- Cross Encoder Reranking

### Code Intelligence

- Tree-sitter
- NetworkX

### Infrastructure

- PostgreSQL
- Redis
- Docker
- GitHub Actions
- OpenTelemetry

---

## 📂 Project Structure

```text
codesage-ai/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── store/
│
├── backend/
│   ├── api/
│   ├── agents/
│   ├── services/
│   ├── parsers/
│   ├── rag/
│   ├── models/
│   └── database/
│
├── docs/
│
├── tests/
│
├── docker/
│
├── scripts/
│
├── .github/
│
├── README.md
├── docker-compose.yml
└── requirements.txt
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/codesage-ai.git

cd codesage-ai
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Run Backend:

```bash
uvicorn main:app --reload
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory:

```env
GEMINI_API_KEY=your_api_key

DATABASE_URL=postgresql://user:password@localhost/codesage

REDIS_URL=redis://localhost:6379

SECRET_KEY=your_secret_key

JWT_SECRET=your_jwt_secret
```

---

## 📈 Development Roadmap

### Phase 1 — MVP

- Repository Clone
- Tree-sitter Parsing
- Embeddings
- ChromaDB
- Repository Chat

### Phase 2

- LangGraph Integration
- Hybrid Retrieval
- Dependency Graph
- Architecture Discovery

### Phase 3

- Security Agent
- Review Agent
- Flow Analysis

### Phase 4

- Documentation Generator
- Test Generator
- Impact Analysis
- Pull Request Review

### Phase 5

- Knowledge Graph
- Incremental Reindexing
- GitHub Webhooks
- OpenTelemetry

---

## 🔒 Security Requirements

### Must Include

- JWT Authentication
- Rate Limiting
- Input Validation
- GitHub URL Validation
- Repository Isolation
- Encrypted Secrets

### Never Allow

- Shell Injection
- Arbitrary Command Execution
- Arbitrary File Access

---

## 📊 Repository Health Score

Evaluate repositories using:

- Security
- Maintainability
- Performance
- Documentation
- Testing

Generate an overall repository score and recommendations.

---

## 🎯 Use Cases

### Developers

Understand unfamiliar codebases quickly.

### Tech Leads

Review architecture and dependencies.

### Security Engineers

Detect vulnerabilities and security risks.

### Open Source Contributors

Onboard faster into large repositories.

### Engineering Managers

Assess project health and maintainability.

---

## 🏆 Resume Description

**CodeSage AI – Autonomous Code Intelligence Agent**

Built a production-grade multi-agent repository intelligence platform using LangGraph, FastAPI, Tree-sitter, ChromaDB, PostgreSQL, Redis, NetworkX, and Retrieval-Augmented Generation (RAG). Implemented repository-aware code understanding through hybrid retrieval, dependency analysis, execution-flow tracing, architecture discovery, security auditing, impact analysis, automated documentation generation, pull request review, and AI-powered repository chat.

---

## 🎯 Final Goal

Create an AI platform that behaves like a senior software engineer who has already studied every file in a repository and can:

- Explain Code
- Understand Architecture
- Trace Execution Flow
- Detect Vulnerabilities
- Review Pull Requests
- Generate Documentation
- Generate Tests
- Analyze Dependencies
- Predict Change Impact

through a scalable multi-agent architecture powered by LangGraph, RAG, Knowledge Graphs, Tree-sitter, and AI-driven Repository Intelligence.

---

## ⭐ Star This Repository

If you find this project useful, consider giving it a ⭐ on GitHub.

Built with ❤️ using FastAPI, LangGraph, React, ChromaDB, Tree-sitter, and Generative AI.
