// Roby's Salon — knowledge base
// Placeholder menu drafted in the style of a multi-branch Nairobi salon/barber/spa.
// Swap in real services, prices and hours whenever ready — nothing else in the
// code needs to change, the AI reads this file directly.

module.exports = {
  businessName: "Roby's Salon, Barber & Spa",

  branches: [
    { name: "Garden City Mall", hours: "Mon–Sat 9am–8pm, Sun 10am–6pm" },
    { name: "Two Rivers Mall", hours: "Mon–Sat 9am–8pm, Sun 10am–6pm" },
    { name: "Sarit Centre", hours: "Mon–Sat 9am–8pm, Sun 10am–6pm" },
  ],

  services: [
    { category: "Hair — Women", name: "Wash & Blowdry", price: "KES 1,500", duration: "45 min" },
    { category: "Hair — Women", name: "Silk Press", price: "KES 2,500", duration: "1 hr" },
    { category: "Hair — Women", name: "Braiding (Box Braids)", price: "KES 4,500", duration: "3 hr" },
    { category: "Hair — Women", name: "Cornrows", price: "KES 2,000", duration: "1.5 hr" },
    { category: "Hair — Women", name: "Colour / Retouch", price: "From KES 3,500", duration: "2 hr" },
    { category: "Hair — Women", name: "Relaxer Treatment", price: "KES 3,000", duration: "1.5 hr" },
    { category: "Barber", name: "Haircut", price: "KES 800", duration: "30 min" },
    { category: "Barber", name: "Haircut + Beard Trim", price: "KES 1,200", duration: "45 min" },
    { category: "Barber", name: "Hot Towel Shave", price: "KES 900", duration: "30 min" },
    { category: "Barber", name: "Kids Haircut (under 12)", price: "KES 600", duration: "30 min" },
    { category: "Nails", name: "Classic Manicure", price: "KES 1,000", duration: "40 min" },
    { category: "Nails", name: "Gel Manicure", price: "KES 1,800", duration: "1 hr" },
    { category: "Nails", name: "Pedicure", price: "KES 1,500", duration: "1 hr" },
    { category: "Nails", name: "Acrylic Full Set", price: "KES 2,500", duration: "1.5 hr" },
    { category: "Spa", name: "Swedish Massage", price: "KES 3,500", duration: "1 hr" },
    { category: "Spa", name: "Facial (Classic)", price: "KES 2,500", duration: "45 min" },
    { category: "Spa", name: "Full Body Waxing", price: "KES 4,000", duration: "1.5 hr" },
  ],

  policies: [
    "Bookings can be made for any of the three branches — always confirm which branch the client wants.",
    "A booking needs: service, branch, preferred date/time, and client name.",
    "If a client asks something outside this menu or wants a price not listed, say a staff member will confirm and continue the conversation, don't invent a price.",
    "If a client seems frustrated, confused, or asks to speak to a human, offer to have a staff member call them back rather than continuing to push the bot flow.",
  ],
};
