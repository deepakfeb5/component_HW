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
