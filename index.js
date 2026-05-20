const API_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const statusText = document.getElementById("status");
const results = document.getElementById("results");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchValue = input.value.trim();
  if (!searchValue) return;

  results.innerHTML = "";
  statusText.textContent = "Recherche en cours...";

  try {
    const stations = await fetchStations(searchValue);
    displayStations(stations);
  } catch (error) {
    console.error(error);
    statusText.textContent = "Erreur lors de la récupération des données.";
  }
});

async function fetchStations(searchValue) {
  const isPostalCode = /^\d{5}$/.test(searchValue);

  const where = isPostalCode
    ? `cp="${searchValue}"`
    : `ville="${searchValue}"`;

  const url = `${API_URL}?where=${encodeURIComponent(where)}&limit=20`;

  const response = await fetch(url);

  if (!response.ok) {
    console.log("Erreur",response);
    throw new Error("Erreur API");
  }

    console.log("Ok",response);
  const data = await response.json();
  return data.results || [];
}

function displayStations(stations) {
  if (stations.length === 0) {
    statusText.textContent = "Aucune station trouvée.";
    return;
  }

  statusText.textContent = `${stations.length} station(s) trouvée(s).`;

  results.innerHTML = stations
    .map((station) => createStationCard(station))
    .join("");
}

function createStationCard(station) {
  const prices = [
    ["Gazole", station.gazole_prix],
    ["SP95", station.sp95_prix],
    ["SP98", station.sp98_prix],
    ["E10", station.e10_prix],
    ["E85", station.e85_prix],
    ["GPLc", station.gplc_prix],
  ];

  const pricesHtml = prices
    .map(([fuel, price]) => `
      <span class="price ${price ? "available" : "missing"}">${fuel} : <b>${price ? price +" €/L" : "-"}</b> </span>
    `)
    .join("");

  return `
    <article class="station-card">
      <h2>${station.marque || "Station-service"}</h2>
      <p>${station.adresse || ""}</p>
      <p>${station.cp || ""} ${station.ville || station.nomcommune || ""}</p>

      <div class="prices">
        ${pricesHtml || "<span>Aucun prix disponible</span>"}
      </div>
    </article>
  `;
}