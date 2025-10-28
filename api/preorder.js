export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const zapUrl = process.env.ZAPIER_PREORDER_HOOK; // Zap A (Catch Hook → Sheet row)
    if (!zapUrl) throw new Error('Missing ZAPIER_PREORDER_HOOK');

    // Body parsing guard
    let body = req.body;
    if (!body || typeof body === 'string') {
      try { body = JSON.parse(body || '{}'); } catch { body = {}; }
    }

    if (!body.email) return res.status(400).json({ error: 'Email required' });

    // Forward to Zapier to write Google Sheet row
    await fetch(zapUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        timestamp: new Date().toISOString(),
        status: 'submitted'
      })
    });

    // Always OK (don’t block UX)
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: true });
  }
}
