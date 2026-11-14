// Shared constants between client and server

export const TOOL_CATEGORIES = [
  "Power Tools",
  "Garden & Yard",
  "Kitchen & Food Prep",
  "Camping & Outdoors",
  "Hand Tools",
  "Cleaning & Maintenance",
  "Automotive",
  "Other",
] as const;

export const TOOL_CONDITIONS = [
  "Brand New",
  "Like New",
  "Good",
  "Fair",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
export type ToolCondition = (typeof TOOL_CONDITIONS)[number];
