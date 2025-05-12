import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import backgroundImage from "./assets/welcome.jpg";

// Marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [wiki, setWiki] = useState(null);
  const [coords, setCoords] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const fetchWeather = async (city) => {
    try {
      const res = await fetch(`https://wttr.in/${city}?format=j1`);
      const data = await res.json();
      const current = data.current_condition[0];
      setWeather({
        name: city,
        temp: current.temp_C,
        wind: current.windspeedKmph,
        humidity: current.humidity,
        condition: current.weatherDesc[0].value,
      });
    } catch {
      alert("⚠️ Fehler beim Abrufen der Wetterdaten.");
    }
  };

  const fetchWikipedia = async (city) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          city
        )}`
      );
      const data = await res.json();
      if (data.extract) {
        setWiki({
          title: data.title,
          extract: data.extract,
          image: data.thumbnail?.source || null,
        });
      } else {
        setWiki(null);
      }
    } catch {
      setWiki(null);
    }
  };

  const fetchCoordinates = async (city) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          city
        )}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCoords({ lat, lon });
        fetchLandmarks(lat, lon);
      } else {
        setCoords(null);
        setLandmarks([]);
      }
    } catch {
      setCoords(null);
      setLandmarks([]);
    }
  };

  const fetchLandmarks = async (lat, lon) => {
    try {
      const query = `
        [out:json];
        (
          node["tourism"="museum"](around:3000,${lat},${lon});
          node["tourism"="attraction"](around:3000,${lat},${lon});
          node["tourism"="artwork"](around:3000,${lat},${lon});
          node["historic"](around:3000,${lat},${lon});
          node["leisure"="park"](around:3000,${lat},${lon});
          node["amenity"="hospital"](around:3000,${lat},${lon});
        );
        out body;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await res.json();
      const filtered = data.elements.filter((el) => el.tags?.name);
      setLandmarks(filtered);
    } catch {
      setLandmarks([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchWeather(city);
    fetchWikipedia(city);
    fetchCoordinates(city);
  };

  const handleReset = () => {
    setCity("");
    setWeather(null);
    setWiki(null);
    setCoords(null);
    setLandmarks([]);
    setSelectedPlace(null);
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
    >
      {!weather && !coords && !wiki && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
            🌍 City Explorer
          </h1>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Stadt eingeben..."
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Suchen
          </button>
        </form>
      )}

      {weather && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">{weather.name}</h2>
          <p className="text-lg mb-1">{weather.condition}</p>
          <p>🌡 Temperatur: {weather.temp}°C</p>
          <p>💨 Wind: {weather.wind} km/h</p>
          <p>💧 Luftfeuchtigkeit: {weather.humidity}%</p>
        </div>
      )}

      {coords && (
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-64 w-full max-w-md mt-6 rounded-xl shadow-md"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lon]}>
            <Popup>{city}</Popup>
          </Marker>
          {landmarks.map((lm) => (
            <Marker
              key={lm.id}
              position={[lm.lat, lm.lon]}
              eventHandlers={{ click: () => setSelectedPlace(lm) }}
            >
              <Popup>
                <strong>{lm.tags?.name}</strong>
                <br />
                {lm.tags?.tourism ||
                  lm.tags?.historic ||
                  lm.tags?.leisure ||
                  lm.tags?.amenity ||
                  "Ort"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {selectedPlace && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md text-left max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">{selectedPlace.tags.name}</h2>
          <p className="text-sm text-gray-600">
            Typ:{" "}
            {selectedPlace.tags.tourism ||
              selectedPlace.tags.historic ||
              selectedPlace.tags.leisure ||
              selectedPlace.tags.amenity}
          </p>
          <p className="text-sm text-gray-600">
            Koordinaten: {selectedPlace.lat}, {selectedPlace.lon}
          </p>
        </div>
      )}

      {wiki && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md text-left max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">{wiki.title}</h2>
          {wiki.image && (
            <img
              src={wiki.image}
              alt={wiki.title}
              className="rounded mb-4 w-full h-auto"
            />
          )}
          <p className="text-gray-700 text-sm">{wiki.extract}</p>
        </div>
      )}

      {(weather || coords || wiki) && (
        <>
          <button
            onClick={handleReset}
            className="fixed bottom-4 left-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Zurück 🔙
          </button>
        </>
      )}
    </div>
  );
}

export default App;
