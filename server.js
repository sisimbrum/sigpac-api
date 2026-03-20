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

    // 1. Consultar catastro (coordenadas)
    const urlCatastro = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfLibres/OVCCoordenadas.svc/json/Consulta_CPMRC?RC=${refcat}`;

    const catRes = await fetch(urlCatastro);
    const catData = await catRes.json();

    const coords = catData?.Consulta_CPMRCResult?.coordenadas?.coord;

    if (!coords) {
      return res.status(404).json({ error: "No se encontraron coordenadas" });
    }

    const lon = parseFloat(coords.x);
    const lat = parseFloat(coords.y);

    // 2. Crear bbox pequeño alrededor
    const delta = 0.001;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

    // 3. Consultar SIGPAC
    const urlSigpac = `https://sigpac-hubcloud.es/ogcapi/collections/recintos/items?bbox=${bbox}&limit=50`;

    const sigRes = await fetch(urlSigpac);
    const sigData = await sigRes.json();

    res.json({
      coords: { lat, lon },
      sigpac: sigData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log("Servidor corriendo");
});