# rag-search

Upload PDFs, ask natural-language questions about their content, and get AI-generated answers grounded in your documents.

A full-stack RAG (Retrieval-Augmented Generation) application with a React frontend and an Express API backend.

## Architecture

```
┌─────────────────────┐      ┌──────────────────────┐      ┌────────────────┐
│   Client (React)    │─────>│  API (Express)       │─────>│  PostgreSQL    │
│   Port 5173         │ HTTP │  Port 3000            │ SQL  │  + pgvector   │
│   React Router v8   │      │  Gemini Embeddings    │      │  Vectors       │
│   Tailwind + Astryx │<─────│  LangChain / LLM     │<─────│  Chunks       │
└─────────────────────┘      └──────────────────────┘      └────────────────┘
```

- **Client** — React Router v8 SPA with Tailwind CSS and Astryx design system
- **API** — Express 5 server handling document upload, embedding (Gemini), vector search (pgvector), and LLM answer generation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v8, Vite 8, Tailwind CSS v4, Astryx, Recharts |
| Backend | Node.js, Express 5, LangChain |
| Database | PostgreSQL with pgvector extension |
| Embeddings | Google Gemini (`gemini-embedding-001`, 3072-dim) |
| LLM | OpenAI-compatible endpoint via LangChain `ChatOpenAI` |
| File Parsing | pdf-parse, Multer |

## Prerequisites

- Node.js >= 20
- PostgreSQL with pgvector extension enabled
- A Gemini API key from Google AI Studio

## Setup

### 1. Database

Create the PostgreSQL database and enable pgvector:

```bash
createdb rag_search
psql -d rag_search -c "CREATE EXTENSION vector;"
```

Then run the schema (create tables `documents`, `document_chunks`, `conversations`, `messages` with the vector column on `document_chunks`).

### 2. API

```bash
cd api
npm install
```

Copy `.env` and configure:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_NAME=rag_search
GEMINI_API_KEY=your_gemini_api_key
PRIMARY_MODEL=deepseek-v4-flash-free
FALLBACK_MODEL=big-pickle
EMBEDDING_MODEL=gemini-embedding-001
ZEN_BASE_URL=https://opencode.ai/zen/v1
ZEN_API_KEY=public
PORT=3000
```

Start the API:

```bash
npm start
```

### 3. Client

```bash
cd client
npm install
```

Copy `.env` and set the API URL:

```env
VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/documents/upload` | Upload a PDF (multipart, field: `file`) |
| `GET` | `/documents` | List all documents with chunk counts |
| `DELETE` | `/documents/:id` | Delete a document and its chunks |
| `POST` | `/chat/ask` | Ask a question (body: `{ question, conversationId? }`) |

## How RAG Works

1. **Upload** — A PDF is uploaded via `/documents/upload`
2. **Parse & Chunk** — Text is extracted with `pdf-parse` and split into overlapping chunks (~1500 chars, 200-char overlap)
3. **Embed** — Each chunk is embedded into a 3072-dim vector via Gemini (`gemini-embedding-001`)
4. **Store** — Vectors are stored in PostgreSQL with pgvector alongside the chunk text
5. **Query** — A user question is embedded with `taskType: "RETRIEVAL_QUERY"`
6. **Retrieve** — The top 4 most similar chunks are found via cosine distance (`<=>` operator)
7. **Generate** — The chunks + conversation history are sent to an LLM to produce a grounded answer

## Project Structure

```
rag-search/
  api/
    src/
      config/          # DB pool, LLM config, Multer, constants
      routes/          # Express route handlers (chat, documents)
      services/        # Gemini embedding + generation logic
      utils/           # Text chunking utility
      index.js         # Express entry point
    .env
    package.json
  client/
    app/
      routes/          # Dashboard, Documents, Chat, Settings pages
      lib/             # Mock data
      styles/          # Global CSS (Tailwind + Astryx)
      root.tsx         # HTML shell + error boundary
      routes.ts        # Route definitions
    .env
    package.json
    vite.config.ts
  README.md
```

## Scripts

| Directory | Command | Description |
|-----------|---------|-------------|
| `api/` | `npm start` | Start API with nodemon (port 3000) |
| `client/` | `npm run dev` | Start Vite dev server (port 5173) |
| `client/` | `npm run build` | Production build |
| `client/` | `npm run start` | Serve production build |

## License

ISC
