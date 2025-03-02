
/**
 * A list of mappings between common merchant keywords and expense categories.
 * Each mapping contains a regex pattern for matching and the corresponding category and icon type.
 */
export const expenseMappings = [
  { regex: /uber|lyft|taxi|cab|metro|subway|train|bus|transit/i, category: "Trasporto", iconType: "car" },
  { regex: /grocery|food|restaurant|cafe|starbucks|coffee|mcdonald|burger|pizza|taco|chipotle|panera/i, category: "Cibo", iconType: "shopping-bag" },
  { regex: /amazon|walmart|target|shopping|store|shop|mall|clothing|electronics|apple/i, category: "Shopping", iconType: "shopping-bag" },
  { regex: /movie|netflix|spotify|hulu|disney|theater|concert|entertainment|game|steam/i, category: "Intrattenimento", iconType: "coffee" },
  { regex: /rent|mortgage|apartment|housing|home|condo|lease|property/i, category: "Alloggio", iconType: "home" },
  { regex: /phone|internet|cable|utility|electric|water|gas|bill|subscription/i, category: "Utenze", iconType: "smartphone" },
];
