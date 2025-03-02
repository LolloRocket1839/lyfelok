
import { Entity, ClassificationResult } from './types';
import { NlpKnowledgeBase } from './knowledgeBase';

/**
 * Classifica il tipo di transazione tra SPESA, ENTRATA, INVESTIMENTO, AUMENTO_REDDITO
 */
export function classifyTransactionType(
  input: string, 
  entities: Entity, 
  knowledgeBase: NlpKnowledgeBase,
  getUserHistoryScoreFn: (entities: Entity, category: string) => number
): ClassificationResult {
  // Calcola punteggi per ogni categoria
  const scores: Record<string, number> = {
    SPESA: calculateCategoryScore(input, entities, 'expenses', knowledgeBase, getUserHistoryScoreFn),
    ENTRATA: calculateCategoryScore(input, entities, 'income', knowledgeBase, getUserHistoryScoreFn),
    INVESTIMENTO: calculateCategoryScore(input, entities, 'investments', knowledgeBase, getUserHistoryScoreFn),
    AUMENTO_REDDITO: calculateCategoryScore(input, entities, 'incomeIncrease', knowledgeBase, getUserHistoryScoreFn)
  };
  
  // Normalizza i punteggi
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const normalizedScores: Record<string, number> = {};
  
  for (const [category, score] of Object.entries(scores)) {
    normalizedScores[category] = total > 0 ? score / total : 0;
  }
  
  // Trova la categoria con il punteggio più alto
  let maxCategory: 'SPESA' | 'ENTRATA' | 'INVESTIMENTO' | 'AUMENTO_REDDITO' = 'SPESA'; // Default
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(normalizedScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category as any;
    }
  }
  
  // Determina la sottocategoria (se applicabile)
  let subcategory = null;
  
  if (maxCategory === 'SPESA') {
    subcategory = determineSubcategory(
      input, 
      entities, 
      knowledgeBase.getCategory('expenses').categories
    );
  } else if (maxCategory === 'INVESTIMENTO') {
    subcategory = determineSubcategory(
      input, 
      entities, 
      knowledgeBase.getCategory('investments').instruments
    );
  } else if (maxCategory === 'ENTRATA') {
    subcategory = determineSubcategory(
      input, 
      entities, 
      knowledgeBase.getCategory('income').sources
    );
  }
  
  return {
    type: maxCategory,
    confidence: maxScore,
    subcategory: subcategory,
    allScores: normalizedScores
  };
}

/**
 * Calcola il punteggio di una categoria in base all'input e alle entità
 */
export function calculateCategoryScore(
  input: string, 
  entities: Entity, 
  category: string,
  knowledgeBase: NlpKnowledgeBase,
  getUserHistoryScoreFn: (entities: Entity, category: string) => number
): number {
  let score = 0;
  const categoryData = knowledgeBase.getCategory(category);
  
  // Punteggio per termini base
  for (const term of categoryData.base) {
    if (input.includes(term)) {
      score += 10; // Peso maggiore per termini base
    }
  }
  
  // Punteggio per parole chiave in sottocategorie/strumenti/fonti
  for (const subcategoryKey in categoryData) {
    if (typeof categoryData[subcategoryKey] === 'object' && 
        !Array.isArray(categoryData[subcategoryKey])) {
      
      for (const subcat in categoryData[subcategoryKey]) {
        if (Array.isArray(categoryData[subcategoryKey][subcat])) {
          for (const term of categoryData[subcategoryKey][subcat]) {
            if (input.includes(term)) {
              score += 5; // Peso per termini di sottocategoria
            }
          }
        }
      }
    }
  }
  
  // Considera anche lo storico dell'utente
  score += getUserHistoryScoreFn(entities, category);
  
  return score;
}

/**
 * Determina la sottocategoria più probabile
 */
export function determineSubcategory(
  input: string, 
  entities: Entity, 
  subcategories: Record<string, string[]>
): string | null {
  let maxScore = 0;
  let bestSubcategory = null;
  
  for (const [subcategory, terms] of Object.entries(subcategories)) {
    let score = 0;
    
    for (const term of terms) {
      if (input.includes(term)) {
        score += 1;
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestSubcategory = subcategory;
    }
  }
  
  return bestSubcategory;
}
