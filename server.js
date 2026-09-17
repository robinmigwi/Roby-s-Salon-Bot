const express = require("express");
const knowledgeBase = require("./knowledge-base");

const app = express();
app.use(express.json());

const {
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WEBHOOK_VERIFY_TOKEN,
  ANTHROPIC_API_KEY,
  PORT = 3000,
} = process.env;

// In-memory store: conversation history + bookings.
// Fine for testing. Resets on every server restart/redeploy.
// Swap for a real database (Postgres, etc.) before this goes to real clients.
const conversations = new Map(); // phone -> [{role, content}, ...]
const bookings = []; // simple in-memory "CRM"

function buildSystemPrompt() {
  const serviceLines = knowledgeBase.services
    .map((s) => `- ${s.category} | ${s.name} | ${s.price} | ${s.duration}`)
    .join("\n");
  const branchLines = knowledgeBase.branches
    .map((b) => `- ${b.name}: ${b.hours}`)
    .join("\n");
  const policyLines = knowledgeBase.policies.map((p) => `- ${p}`).join("\n");

  return `You are the WhatsApp assistant for ${knowledgeBase.businessName}, a salon, barber and spa in Nairobi.

You help customers on WhatsApp: answer questions about services and pricing, and book appointments.

BRANCHES:
${branchLines}

SERVICES:
${serviceLines}

POLICIES:
${policyLines}

Keep replies short and natural, like a real WhatsApp conversation, not an email. Ask one question at a time when collecting booking details.

When you have ALL of these confirmed with the client — service, branch, date/time, and their name —
end your reply with a line in exactly this format on its own:
[BOOKING_CONFIRMED: service=<service>, branch=<branch>, when=<date/time>, name=<client name>]

Only output that line once you actually have all four details confirmed by the client, not before.`;
}

async function askClaude(phone, userMessage) {
  const history = conversations.get(phone) || [];
  history.push({ role: "user", content: userMessage });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: buildSystemPrompt(),
      messages: history,
    }),
  });

  const data = await response.json();
  const reply = data?.content?.find((b) => b.type === "text")?.text || "";

  history.push({ role: "assistant", content: reply });
  // Keep last 20 turns so the payload doesn't grow forever.
  conversations.set(phone, history.slice(-20));

  return reply;
}

function extractBooking(replyText) {
  const match = replyText.match(/\[BOOKING_CONFIRMED:\s*(.+?)\]/);
  if (!match) return null;

  const fields = {};
  match[1].split(",").forEach((pair) => {
    const [key, ...rest] = pair.split("=");
    if (key) fields[key.trim()] = rest.join("=").trim();
  });
  return fields;
}

async function sendWhatsAppMessage(to, text) {
  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    }),
  });
}

// Meta calls this once to verify the webhook URL is real.
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verified.");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Meta posts incoming messages here.
app.post("/webhook", async (req, res) => {
  // Acknowledge immediately, Meta expects a fast 200.
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message || message.type !== "text") return;

    const from = message.from; // customer's phone number
    const text = message.text.body;

    console.log(`Incoming from ${from}: ${text}`);

    const reply = await askClaude(from, text);
    const booking = extractBooking(reply);
    const customerFacingReply = reply.replace(/\[BOOKING_CONFIRMED:.*?\]/, "").trim();

    await sendWhatsAppMessage(from, customerFacingReply);

    if (booking) {
      bookings.push({ phone: from, ...booking, capturedAt: new Date().toISOString() });
      // This is the "staff alert" — for now it's a console log + the /bookings endpoint below.
      // Swap this for a real CRM webhook / Slack alert / email once ready.
      console.log("NEW BOOKING:", booking);
    }
  } catch (err) {
    console.error("Error handling webhook:", err);
  }
});

// Simple staff-side view — visit this URL to see captured bookings.
app.get("/bookings", (req, res) => {
  res.json(bookings);
});

app.get("/", (req, res) => {
  res.send(`${knowledgeBase.businessName} bot is running.`);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
