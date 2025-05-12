// فرمول Haversine برای محاسبه فاصله بین دو مختصات
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // شعاع زمین به کیلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2); // دو رقم اعشار
}

// نمونه مکان‌ها
const places = [
  { name: "Tehran", lat: 35.6892, lon: 51.389 },
  { name: "Shiraz", lat: 29.5918, lon: 52.5837 },
  { name: "Esfahan", lat: 32.6539, lon: 51.666 },
  { name: "Tabriz", lat: 38.08, lon: 46.2919 },
];

// ساخت ماتریس فاصله
const matrix = [];

for (let i = 0; i < places.length; i++) {
  matrix[i] = [];
  for (let j = 0; j < places.length; j++) {
    if (i === j) {
      matrix[i][j] = 0;
    } else {
      matrix[i][j] = getDistance(
        places[i].lat,
        places[i].lon,
        places[j].lat,
        places[j].lon
      );
    }
  }
}

// چاپ ماتریس
console.log("\nDistance Matrix (in km):\n");
console.log("\t" + places.map((p) => p.name).join("\t"));
for (let i = 0; i < matrix.length; i++) {
  const row = matrix[i].map((d) => d.toFixed(2)).join("\t");
  console.log(places[i].name + "\t" + row);
} //node matrix.js اجرا
