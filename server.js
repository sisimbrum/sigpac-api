import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api/recintos", async (req, res) => {
  try {
    const { bbox, pol, par, rec } = req.query;

    // Caso 1: búsqueda por bbox (mapa)
    if (bbox) {
      const url = `https://sigpac-hubcloud.es/ogcapi/collections/recintos/items?bbox=${bbox}&limit=50`;

      const response = await fetch(url);
      const data = await response.json();

      return res.json(data);
    }

    // Caso 2: búsqueda por identificadores
    if (pol && par) {
      const url = `https://sigpac-hubcloud.es/ogcapi/collections/recintos/items?limit=50`;

      const response = await fetch(url);
      const data = await response.json();

      // filtrado simple en backend
      const filtered = data.features.filter(f => {
        const props = f.properties;
        return (
          props.poligono == pol &&
          props.parcela == par &&
          (rec ? props.recinto == rec : true)
        );
      });

      return res.json({
        type: "FeatureCollection",
        features: filtered
      });
    }

    res.status(400).json({ error: "Parámetros insuficientes" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log("Servidor corriendo");
});