let map;
let markers = [];

function resetPage() {
  location.reload();
}

document
  .getElementById("city-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") searchCity();
  });

async function searchCity() {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return alert("Bitte Stadt eingeben.");

  document.getElementById("form-card").style.display = "none";
  document.getElementById("weather").innerHTML = "Lade Wetterdaten...";
  document.getElementById("weather").style.display = "block";

  // Wetterdaten
  try {
    const res = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await res.json();
    const cur = data.current_condition[0];
    const desc = cur.weatherDesc[0].value;
    document.getElementById("weather").innerHTML = `
      <h3>${city}</h3>
      <p><strong>${desc}</strong></p>
      <p>🌡 Temperatur: ${cur.temp_C}°C</p>
      <p>💨 Wind: ${cur.windspeedKmph} km/h</p>
      <p>💧 Luftfeuchtigkeit: ${cur.humidity}%</p>
    `;
  } catch {
    document.getElementById("weather").innerHTML =
      "Wetterdaten konnten nicht geladen werden.";
  }

  // Koordinaten holen
  let lat = null,
    lon = null;
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        city
      )}&format=json&limit=1`
    );
    const geoData = await geoRes.json();
    if (geoData.length > 0) {
      lat = parseFloat(geoData[0].lat);
      lon = parseFloat(geoData[0].lon);
    }
  } catch {}

  if (lat && lon) {
    const query = `
      [out:json];
      (
        node["tourism"](around:3000,${lat},${lon});
        node["historic"](around:3000,${lat},${lon});
        node["leisure"="park"](around:3000,${lat},${lon});
      );
      out body;
    `;
    try {
      const placeRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const placeData = await placeRes.json();
      showMap(
        lat,
        lon,
        placeData.elements.filter((e) => e.tags?.name)
      );
    } catch {
      document.getElementById("map").innerHTML = "Keine Orte gefunden.";
    }
  }

  // Wikipedia
  try {
    const wikiRes = await fetch(
      `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        city
      )}`
    );
    const wiki = await wikiRes.json();
    document.getElementById("wiki").innerHTML = `
      <h3>${wiki.title}</h3>
      <p>${wiki.extract}</p>
      ${
        wiki.thumbnail
          ? `<img src="${wiki.thumbnail.source}" alt="${wiki.title}" />`
          : ""
      }
    `;
    document.getElementById("wiki").style.display = "block";
  } catch {
    document.getElementById("wiki").innerHTML =
      "Wikipedia Info nicht verfügbar.";
    document.getElementById("wiki").style.display = "block";
  }

  document.getElementById("back-btn").style.display = "inline-block";
}

function showMap(lat, lon, places) {
  document.getElementById("map").style.display = "block";
  document.getElementById("map").innerHTML = "";

  setTimeout(() => {
    map = L.map("map").setView([lat, lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup("Zentrum");

    places.slice(0, 100).forEach((p) => {
      const m = L.marker([p.lat, p.lon]).addTo(map).bindPopup(p.tags.name);
      markers.push(m);
    });

    map.invalidateSize();
  }, 300);
}
