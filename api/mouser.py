from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import io

app = FastAPI()

@app.post("/api/mouser")
async def mouser_bom(file: UploadFile = File(...)):
    data = await file.read()
    df = pd.read_csv(io.BytesIO(data))

    # Placeholder pricing (replace with real Mouser API lookup)
    items = []
    for _, row in df.iterrows():
        qty = int(row["Quantity"])
        unit_price = 1.23
        total = round(qty * unit_price, 2)

        items.append({
            "part": row["PartNumber"],
            "qty": qty,
            "price": unit_price,
            "total": total
        })

    return JSONResponse({"items": items})
