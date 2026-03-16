# component_HW
Component Mouser source

# Mouser BOM – FastAPI (+ Next.js on Vercel)

A tiny monorepo that lets you upload a BOM (CSV) and get pricing/stock via a FastAPI endpoint.  
Frontend (optional): Next.js in `web/`.  
Backend: `api/mouser.py` exposed at `/api/mouser` on Vercel.

---

## Folder Structur
.
├── api/
│   └── mouser.py          # FastAPI app exposing /api/mouser
├── web/                   # (Optional) Next.js frontend
│   ├── package.json
│   └── pages/
├── requirements.txt
├── vercel.json
└── README.md

## Environment Variables

Create a **secure** `.env` (locally) and set variables in **Vercel → Project → Settings → Environment Variables**.

- `MOUSER_API_KEY` = `your-key-here`

> **Never commit real API keys** to Git, README, or `.env` files.

For local development with Next.js, create `web/.env.local`:


---

## Backend (FastAPI)

Install deps:

```bash
pip install -r requirements.txt

uvicorn api.mouser:app --host 0.0.0.0 --port 8000 --reload
