const cities = [];
let matrix = [];

function addCity() {
  const name = document.getElementById("name").value.trim();
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);

  if (!name || isNaN(lat) || isNaN(lon)) {
    alert("Bitte gültige Stadt und Koordinaten eingeben!");
    return;
  }

  cities.push({ name, lat, lon });
  updateCityList();
  updateDropdowns();

  document.getElementById("name").value = "";
  document.getElementById("lat").value = "";
  document.getElementById("lon").value = "";
}

function deleteCity(index) {
  cities.splice(index, 1);
  updateCityList();
  updateDropdowns();
  document.getElementById("matrix-table").innerHTML = "";
  document.getElementById("network").innerHTML = "";
  document.getElementById("result").innerText = "";
}

function updateCityList() {
  const ul = document.getElementById("city-list");
  ul.innerHTML = "";
  cities.forEach((c, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${c.name} (${c.lat}, ${c.lon}) <button class='btn-danger' onclick='deleteCity(${index})'>Löschen 🗑️</button>`;
    ul.appendChild(li);
  });
}

function updateDropdowns() {
  const start = document.getElementById("start");
  const ziel = document.getElementById("ziel");
  start.innerHTML = ziel.innerHTML = "";
  cities.forEach((c, i) => {
    const opt1 = new Option(c.name, i);
    const opt2 = new Option(c.name, i);
    start.appendChild(opt1);
    ziel.appendChild(opt2);
  });
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

function buildMatrix() {
  if (cities.length < 2) {
    alert("Mindestens zwei Städte werden benötigt!");
    return;
  }

  matrix = [];
  for (let i = 0; i < cities.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < cities.length; j++) {
      matrix[i][j] =
        i === j
          ? 0
          : getDistance(
              cities[i].lat,
              cities[i].lon,
              cities[j].lat,
              cities[j].lon
            );
    }
  }

  renderTable(matrix);
  drawGraph(matrix);
}

function renderTable(matrix) {
  const container = document.getElementById("matrix-table");
  let html = "<table><thead><tr><th>Stadt</th>";
  cities.forEach((c) => (html += `<th>${c.name}</th>`));
  html += "</tr></thead><tbody>";

  for (let i = 0; i < cities.length; i++) {
    html += `<tr><th>${cities[i].name}</th>`;
    for (let j = 0; j < cities.length; j++) {
      html += `<td>${matrix[i][j]}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table>";
  container.innerHTML = html;
}

function drawGraph(matrix) {
  const nodes = cities.map((c, i) => ({ id: i, label: c.name }));
  const edges = [];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix.length; j++) {
      edges.push({ from: i, to: j, label: matrix[i][j] + " km" });
    }
  }

  const container = document.getElementById("network");
  const data = {
    nodes: new vis.DataSet(nodes),
    edges: new vis.DataSet(edges),
  };
  const options = { edges: { arrows: "to" } };
  new vis.Network(container, data, options);
}

function findShortestPath() {
  const start = parseInt(document.getElementById("start").value);
  const ziel = parseInt(document.getElementById("ziel").value);

  const dist = Array(cities.length).fill(Infinity);
  const prev = Array(cities.length).fill(null);
  dist[start] = 0;

  const visited = new Set();

  while (visited.size < cities.length) {
    let u = null;
    for (let i = 0; i < cities.length; i++) {
      if (!visited.has(i) && (u === null || dist[i] < dist[u])) {
        u = i;
      }
    }

    visited.add(u);

    for (let v = 0; v < cities.length; v++) {
      if (!visited.has(v)) {
        const alt = dist[u] + matrix[u][v];
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }
  }

  const path = [];
  for (let at = ziel; at !== null; at = prev[at]) {
    path.push(cities[at].name);
  }

  document.getElementById("result").innerText = `Kürzester Pfad: ${path
    .reverse()
    .join(" ➡️ ")} (Distanz: ${dist[ziel].toFixed(2)} km)`;
}

function resetAll() {
  document.getElementById("matrix-table").innerHTML = "";
  document.getElementById("network").innerHTML = "";
  document.getElementById("result").innerText = "";
}
