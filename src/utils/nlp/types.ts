
export interface Entity {
  amount: number | null;
  currency: string;
  date: Date;
  description: string;
  keywords: string[];
  wasTypoCorrected?: boolean;
  originalInput?: string;
}

export interface ClassificationResult {
  type: 'SPESA' | 'ENTRATA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO';
  confidence: number;
  subcategory: string | null;
  allScores: Record<string, number>;
}

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
