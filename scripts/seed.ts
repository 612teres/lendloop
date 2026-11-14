/**
 * LendLoop Demo Data Seed Helper
 *
 * Demonstrates a populated neighborhood tool library with:
 * - Diverse categories (Power Tools, Garden, Kitchen, Camping, Hand Tools)
 * - Various conditions
 * - Active loans, pending requests, and overdue loan scenario for n8n testing
 */

export const SAMPLE_TOOLS = [
  {
    name: "DeWalt 20V Max Cordless Drill Kit",
    category: "Power Tools",
    condition: "Like New",
    description: "Includes 2 lithium-ion batteries, high-speed charger, and 30-piece drill/driver bit set.",
  },
  {
    name: "Honda 21-inch Gas Lawn Mower",
    category: "Garden & Yard",
    condition: "Good",
    description: "Self-propelled 3-in-1 mower (mulch, bag, discharge). Please return with full unleaded fuel.",
  },
  {
    name: "Instant Pot Duo 7-in-1 Pressure Cooker (6 Qt)",
    category: "Kitchen & Food Prep",
    condition: "Brand New",
    description: "Great for making stews, yogurt, broth, and rice. Includes stainless steel steamer basket.",
  },
  {
    name: "Coleman 6-Person Dark Room Camping Tent",
    category: "Camping & Outdoors",
    condition: "Excellent",
    description: "Blocks 90% of sunlight. Easy 10-minute setup with WeatherTec system and rainfly included.",
  },
  {
    name: "Bosch Laser Distance Measure (165 ft)",
    category: "Hand Tools",
    condition: "Brand New",
    description: "Accurate to 1/16-inch. Great for interior layout, room dimensioning, and home renovation.",
  },
  {
    name: "Kärcher 2000 PSI Electric Pressure Washer",
    category: "Cleaning & Maintenance",
    condition: "Good",
    description: "Includes turbo nozzle, 25-ft high-pressure hose, and detergent tank. Ideal for patios and driveways.",
  },
];

console.log(`[LendLoop Seed] Defined ${SAMPLE_TOOLS.length} sample tools across categories.`);
