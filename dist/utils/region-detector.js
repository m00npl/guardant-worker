// src/utils/region-detector.ts
async function detectRegion() {
  try {
    const response = await fetch("http://ip-api.com/json/", {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    const regionMap = {
      "United States": "us-east",
      Canada: "us-east",
      "United Kingdom": "europe",
      Germany: "europe",
      France: "europe",
      Poland: "europe",
      Netherlands: "europe",
      Singapore: "asia",
      Japan: "asia",
      Australia: "oceania",
      Brazil: "south-america",
      India: "asia"
    };
    return regionMap[data.country] || null;
  } catch (error) {
    console.error("Failed to detect region:", error);
    return null;
  }
}
export {
  detectRegion
};
