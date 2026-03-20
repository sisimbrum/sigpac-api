import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api/recintos", async (req, res) => {
  try {
    const { prov, mun, pol, par, rec } = req.query;

    const url = `https://sigpac-hubcloud.es/ogcapi/collections/recintos/items?limit=200`;

    const response = await fetch(url);
    const data = await response.json();

    const filtrados = data.features.filter(f => {
      const p = f.properties;

      return (
        (!prov || p.provincia == prov) &&
        (!mun || p.municipio == mun) &&
        (!pol || p.poligono == pol) &&
        (!par || p.parcela == par) &&
        (!rec || p.recinto == rec)
      );
    });

    res.json({
      type: "FeatureCollection",
      features: filtrados
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/catastral", async (req, res) => {
  try {
    const { refcat } = req.query;

    if (!refcat) {
      return res.status(400).json({ error: "Falta referencia catastral" });
    }

    const url = `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.aspx?ReferenciaCatastral=${refcat}`;

    const response = await fetch(url);
    const text = await response.text();

    // Devolvemos el XML tal cual (sin intentar parsearlo)
    res.type("application/xml");
    res.send(text);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo");
});