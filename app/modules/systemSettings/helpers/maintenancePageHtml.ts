function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function maintenancePageHtml(message?: string): string {
  const displayMessage = escapeHtml(message || "We'll be back shortly.");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sandpiper - Maintenance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fafafa;
      color: #18181b;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 480px;
    }
    .logo { width: 120px; margin-bottom: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; }
    p { font-size: 1rem; color: #71717a; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <img src="/assets/sandpiper-logo.svg" alt="Sandpiper" class="logo" />
    <h1>Sandpiper is under maintenance</h1>
    <p>${displayMessage}</p>
  </div>
</body>
</html>`;
}
