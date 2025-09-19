import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [short, setShort] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    setShort(data.shortUrl);
    setExpiresAt(data.expiresAt)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "300px" }}
        />
        <button type="submit">Shorten</button>
      </form>
      {short && (
        <p>
          Short URL: <a href={short}>{short}</a>
          <br />
          Expires At : {expiresAt}
        </p>
      )}
    </div>
  );
}
