export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const zapUrl = process.env.ZAPIER_TT_WEBHOOK_HOOK; // optional; you can leave unset

    // Parse body safely
    let event = req.body;
    if (!event || typeof event === 'string') {
      try { event = JSON.parse(event || '{}'); } catch { event = {}; }
    }

    // Pull useful bits defensively
    const attrs = event?.data?.attributes || {};
    const email = attrs.email || attrs.customer_email || '';
    const orderId = event?.data?.id || attrs.order_id || '';
    const tickets = attrs.tickets || attrs.line_items || [];
    const paidAt = attrs.paid_at || attrs.completed_at || '';

    if (zapUrl && email) {
      await fetch(zapUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tt_order_id: orderId,
          tt_items: JSON.stringify(tickets),
          tt_paid_at: paidAt,
          status: 'paid'
        })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: true });
  }
}
