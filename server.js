import express from "express";
import fetch from "node-fetch";
import cors from "cors";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
app.use(cors());

app.get("/api/recintos", async (req, res) => {
  try {
    const { bbox } = req.query;

    if (!bbox) {
      return res.status(400).json({ error: "Falta bbox" });
    }

    const url = `https://sigpac-hubcloud.es/ogcapi/collections/recintos/items?bbox=${bbox}&limit=50`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo");
});