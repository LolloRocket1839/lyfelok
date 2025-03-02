export interface CategoryDefinition {
  weight: number;
  category: string;
  tags: string[];
}

export interface KnowledgeBaseData {
  categories: Record<string, CategoryDefinition>;
}

// Ensure this object includes all possible categories to avoid TypeScript errors
export const knowledgeBaseData: KnowledgeBaseData = {
  categories: {
    // Transaction categories
    "cibo": { weight: 10, category: "Cibo", tags: ["alimentari", "supermercato", "ristorante", "bar"] },
    "alloggio": { weight: 10, category: "Alloggio", tags: ["affitto", "mutuo", "casa"] },
    "trasporto": { weight: 10, category: "Trasporto", tags: ["benzina", "autobus", "treno", "auto"] },
    "intrattenimento": { weight: 8, category: "Intrattenimento", tags: ["cinema", "teatro", "concerti"] },
    "utenze": { weight: 9, category: "Utenze", tags: ["bollette", "luce", "gas", "acqua", "internet"] },
    "shopping": { weight: 8, category: "Shopping", tags: ["vestiti", "scarpe", "accessori"] },
    "salute": { weight: 9, category: "Salute", tags: ["medico", "farmacia", "dentista"] },
    "istruzione": { weight: 8, category: "Istruzione", tags: ["università", "libri", "corsi"] },
    "investimenti": { weight: 8, category: "Investimento", tags: ["azioni", "fondi", "etf", "risparmio"] },
    "stipendio": { weight: 10, category: "Stipendio", tags: ["salario", "paga", "mensile"] },
    "altro": { weight: 5, category: "Altro", tags: ["varie", "misc"] },
    // Add any other categories that might be referenced in the codebase
    "Cibo": { weight: 10, category: "Cibo", tags: ["alimentari", "supermercato", "ristorante", "bar"] },
    "Alloggio": { weight: 10, category: "Alloggio", tags: ["affitto", "mutuo", "casa"] },
    "Trasporto": { weight: 10, category: "Trasporto", tags: ["benzina", "autobus", "treno", "auto"] },
    "Intrattenimento": { weight: 8, category: "Intrattenimento", tags: ["cinema", "teatro", "concerti"] },
    "Utenze": { weight: 9, category: "Utenze", tags: ["bollette", "luce", "gas", "acqua", "internet"] },
    "Shopping": { weight: 8, category: "Shopping", tags: ["vestiti", "scarpe", "accessori"] },
    "Salute": { weight: 9, category: "Salute", tags: ["medico", "farmacia", "dentista"] },
    "Istruzione": { weight: 8, category: "Istruzione", tags: ["università", "libri", "corsi"] },
    "Investimento": { weight: 8, category: "Investimento", tags: ["azioni", "fondi", "etf", "risparmio"] },
    "Stipendio": { weight: 10, category: "Stipendio", tags: ["salario", "paga", "mensile"] },
    "Altro": { weight: 5, category: "Altro", tags: ["varie", "misc"] }
  },
};
