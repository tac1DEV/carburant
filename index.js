const API_URL =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records";

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions"); 
const results = document.getElementById("results");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const searchValue = input.value.trim();
  if (!searchValue) return;

  suggestions.innerHTML = "";
  results.innerHTML = "";

  try {
    const stations = await fetchStations(searchValue);
    displayStations(stations);
  } catch (error) {
    console.error(error);
    statusText.textContent = "Erreur lors de la récupération des données.";
  }
});

input.addEventListener("input", async () => {
  const value = input.value.trim();

  if (value.length < 3 && /^\d+$/.test(value) || value === "") {
    suggestions.classList.add("hidden");
    suggestions.innerHTML = "";
    return;
  }

  try {
    const cities = await searchCities(value);

    if (cities.length === 0) {
      suggestions.classList.remove("hidden");
      suggestions.innerHTML = `
        <div class="suggestion-item">
          Aucun résultat
        </div>
      `;
      return;
    }

    suggestions.classList.remove("hidden");

    suggestions.innerHTML = cities
      .map(city => `
        <div 
          class="suggestion-item" 
          data-city="${city.nom}"
          data-postcode="${city.codesPostaux[0]}"
        >
          ${city.nom} (${city.codesPostaux.join(", ")})
        </div>
      `)
      .join("");

  } catch (error) {
    console.error(error);
    suggestions.classList.add("hidden");
    suggestions.innerHTML = "";
  }
});

suggestions.addEventListener("click", (event) => {
  const item = event.target.closest(".suggestion-item");

  if (!item || !item.dataset.city) return;

  input.value = item.dataset.city;

  suggestions.classList.add("hidden");
  suggestions.innerHTML = "";
});

async function searchCities(query) {
  const isPostalCode = /^\d+$/.test(query);

  const url = isPostalCode
    ? `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(query)}&fields=nom,codesPostaux,centre,population&boost=population&limit=5`
    : `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux,centre,population&boost=population&limit=5`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Erreur API communes");
  }

  return await response.json();
}

async function fetchStations(searchValue) {
  const isPostalCode = /^\d{5}$/.test(searchValue);

  suggestions.classList.add("hidden");
  const where = isPostalCode
    ? `cp="${searchValue}"`
    : `ville="${searchValue}"`;

  const url = `${API_URL}?where=${encodeURIComponent(where)}&limit=20`;

  const response = await fetch(url);

  if (!response.ok) {
    console.log("Erreur",response);
    throw new Error("Erreur API");
  }

  const data = await response.json();
  return data.results || [];
}

function displayStations(stations) {

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
     <span class="price ${price ? "available" : "missing"}" id="${fuel}">${fuel} : <b>${price ? price +" €/L" : "-"}</b> </span>
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