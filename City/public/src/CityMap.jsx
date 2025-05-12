import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// تابع برای محاسبه فاصله بین دو مختصات
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // شعاع زمین بر حسب کیلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // نتیجه به کیلومتر
}

const places = [
  { name: "Eiffel Tower", lat: 48.8584, lon: 2.2945 },
  { name: "Louvre Museum", lat: 48.8606, lon: 2.3376 },
  { name: "Notre-Dame", lat: 48.8529, lon: 2.35 },
];

export default function CityMap() {
  return (
    <MapContainer
      center={[48.8566, 2.3522]} // مختصات پاریس
      zoom={14}
      scrollWheelZoom={true}
      className="h-96 w-full rounded-xl z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {places.map((place, i) => (
        <Marker key={i} position={[place.lat, place.lon]}>
          <Popup>{place.name}</Popup>
        </Marker>
      ))}

      <Polyline positions={places.map((p) => [p.lat, p.lon])} color="blue" />

      {places.map((place, index) => {
        if (index === 0) return null;
        const prev = places[index - 1];
        const distance = getDistanceFromLatLonInKm(
          prev.lat,
          prev.lon,
          place.lat,
          place.lon
        );

        const midLat = (prev.lat + place.lat) / 2;
        const midLon = (prev.lon + place.lon) / 2;

        return (
          <Marker position={[midLat, midLon]} key={`dist-${index}`}>
            <Popup>{distance} km</Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
