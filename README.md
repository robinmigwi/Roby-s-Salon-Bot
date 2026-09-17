# Roby's Salon WhatsApp Bot — Test Build

An AI front desk over WhatsApp: answers questions about services, books
appointments, and logs the booking. Built to test the concept before it's
packaged as a DigiGuru offering.

## What's real vs simulated

- **Real:** the AI understanding customer questions, holding a natural
  conversation, and deciding when a booking is complete.
- **Real:** sending and receiving actual WhatsApp messages via Meta's API.
- **Simulated:** the "CRM alert" is currently a console log plus a `/bookings`
  page, not a real CRM. The reminder step isn't built yet, since sending a
  message to a customer *first* (not replying to them) requires an approved
  message template, a later step.

## Deploying to Render (free tier)

1. Create a new **Web Service** on Render, connect it to a GitHub repo
   containing these files (or use Render's "deploy from local files" option
   if you're not using GitHub yet).
2. Build command: `npm install`
   Start command: `npm start`
3. Under the **Environment** tab, add these variables (values from your
   Meta API Setup page and your Anthropic console, typed directly into
   Render, not stored in any file):
   - `WHATSAPP_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WEBHOOK_VERIFY_TOKEN` — make up any random string, e.g. `robys-salon-2026`, you just need the same value in both places (see step 5)
   - `ANTHROPIC_API_KEY`
4. Deploy. Render will give you a URL like
   `https://robys-salon-bot.onrender.com`.
5. Go back to Meta for Developers → your app → WhatsApp → Configuration,
   and set:
   - **Callback URL:** `https://robys-salon-bot.onrender.com/webhook`
   - **Verify token:** the same string you set as `WEBHOOK_VERIFY_TOKEN`
   - Subscribe to the `messages` webhook field.

## Testing

Message your WhatsApp test number from your phone. The bot should reply
within a few seconds. Ask about a service, then try booking one, e.g.
"I want a haircut at Two Rivers on Saturday."

Visit `https://your-app.onrender.com/bookings` to see captured bookings.

## Known limitations (test build, not production)

- Conversation history and bookings live in memory, they're wiped every
  time the server restarts or redeploys. Fine for testing, needs a real
  database before any client sees this.
- No reminder messages yet, that needs an approved outbound template.
- No handling for images, voice notes, or multiple messages sent in quick
  succession, only single text messages.
- The temporary access token from Meta's test setup expires in 24 hours,
  swap it for a permanent System User token once you're testing beyond a
  single day.
