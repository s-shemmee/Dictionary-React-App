export default async function handler(req, res) {
  const query = String(req.query.query || "").trim().slice(0, 100);
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const key = process.env.PEXELS_KEY;
  if (!key) {
    return res.status(500).json({ error: "Photos not configured" });
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9`,
      { headers: { Authorization: key } },
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream error" });
    }
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ photos: data.photos || [] });
  } catch {
    return res.status(502).json({ error: "Failed to fetch photos" });
  }
}