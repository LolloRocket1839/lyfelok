
export interface Entity {
  amount: number | null;
  currency: string;
  date: Date;
  description: string;
  keywords: string[];
  wasTypoCorrected?: boolean;
  originalInput?: string;
}

export interface ProcessedText {
  originalText: string;
  normalizedText: string;
  cleanText: string;
  tokens: string[];
  language: 'en' | 'it';
}

export interface ClassificationResult {
  type: 'SPESA' | 'ENTRATA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO';
  confidence: number;
  subcategory: string | null;
  allScores: Record<string, number>;
  category?: string | null; // For backward compatibility
}

export interface ExtractedEntities {
  amount: number | null;
  currency: string;
  date: Date;
  description: string;
  keywords: string[];
}

export type IntentType = 'unknown' | 'add_income' | 'add_expense' | 'add_investment' | 'change_view' | 'dashboard' | 'finances' | 'projections' | 'navigation';

export interface TransactionHistory {
  timestamp: Date;
  entities: {
    description: string;
    amount: number;
  };
  classification: {
    type: string;
    category: string | null;
  };
}

export interface VariationMap {
  [key: string]: string;
}

export interface CategoryTerms {
  [key: string]: string[];
}

export interface CategoryVariations {
  [key: string]: string[];
}

export interface KnowledgeCategory {
  base: string[];
  variations: VariationMap;
  categories?: CategoryTerms;
  categoriesVariations?: CategoryVariations;
  instruments?: CategoryTerms;
  instrumentsVariations?: VariationMap;
  sources?: CategoryTerms;
  sourcesVariations?: VariationMap;
}

export interface KnowledgeBaseData {
  expenses: KnowledgeCategory;
  investments: KnowledgeCategory;
  income: KnowledgeCategory;
  incomeIncrease: KnowledgeCategory;
}
