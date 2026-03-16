import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const backend = process.env.BACKEND_URL!; // e.g., https://<your-project>.vercel.app/api

  const res = await fetch(`${backend}/process-bom`, {
    method: "POST",
    body: form,
  });

  const json = await res.json();
  return NextResponse.json(json);
}
