from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import io, os, requests

app = FastAPI()

@app.post("/api/mouser")
async def mouser_bom(file: UploadFile = File(...)):
    # Read CSV: expect columns PartNumber,Quantity
    data = await file.read()
    df = pd.read_csv(io.BytesIO(data))

    # TODO: Replace with real Mouser API integration
    items = []
    for _, row in df.iterrows():
        items.append({
            "part": str(row["PartNumber"]),
            "qty": int(row["Quantity"]),
            "price": 1.23,                       # placeholder
            "total": round(1.23 * int(row["Quantity"]), 2)
        })

    return JSONResponse({"items": items})
