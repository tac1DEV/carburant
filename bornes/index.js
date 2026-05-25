const IRVE_URL = "https://static.data.gouv.fr/resources/base-nationale-des-irve-infrastructures-de-recharge-pour-vehicules-electriques/20260525-035634/consolidation-etalab-schema-irve-statique-v-2.3.1-20260525.geojson";

let bornes = [];
// Chargement des bornes à partir de l'URL
async function loadBornes() {
  const res = await fetch(IRVE_URL);
  const geojson = await res.json();
  bornes = geojson.features;
}

async function geocode(query) {
  const url = `https://data.geopf.fr/geocodage/search/?q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url);
  const data = await res.json();

  const feature = data.features[0];
  console.log(feature);
  if (!feature) throw new Error("Lieu introuvable");

  const [lon, lat] = feature.geometry.coordinates;
  return { lat, lon, label: feature.properties.label };
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

document.getElementById("btn").addEventListener("click", async () => {
  const query = document.getElementById("search").value.trim();
  const results = document.getElementById("results");

  if (!query) return;

  results.innerHTML = "Recherche...";

  const location = await geocode(query);
  const groupes = bornes
    .map(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      return {
        ...feature.properties,
        lat,
        lon,
        distance: distanceKm(location.lat, location.lon, lat, lon)
        };
    })
    .filter(borne => borne.distance <= 10)
    .sort((a, b) => a.distance - b.distance)
    // .slice(0, 100)
    .reduce((acc, borne) => {
  const adresse = borne.adresse_station || "Adresse inconnue";

    if (!acc[adresse]) {
      acc[adresse] = {
        nom_amenageur: borne.nom_amenageur,
        adresse_station: adresse,
        nbBornes: 0,
        lat: borne.lat,
        lon: borne.lon,
        distance: borne.distance,
        puissance_nominale: borne.puissance_nominale,
        condition_acces: borne.condition_acces
      };
    }

    acc[adresse].nbBornes++;

    return acc;
  }, {});

const stations = Object.values(groupes);

console.log(stations);
// Power Dot France - 109 Rue Léo Lagrange, 77190 Dammarie-les-Lys
results.innerHTML = stations.map(station => `
  <article class="station">
    <h3>${station.nom_amenageur} - ${station.adresse_station} (${station.distance.toFixed(1)} km)</h3>
    <p>
      Il y a <b>${station.nbBornes}</b>
      borne${station.nbBornes > 1 ? "s" : ""}
      disponible${station.nbBornes > 1 ? "s" : ""}
    </p>
    <p>Puissance max : ${station.puissance_nominale || "?"} kW</p>
    <p>Accès : ${station.condition_acces || "Non renseigné"}</p>
  </article>
`).join("");
});

loadBornes();