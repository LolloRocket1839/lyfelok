
import { NlpKnowledgeBase } from './knowledgeBase';

/**
 * Normalizza l'input dell'utente (lowercase, rimozione spazi extra, ecc.)
 */
export function normalizeInput(input: string): string {
  let normalized = input.toLowerCase().trim();
  // Normalizza spazi multipli
  normalized = normalized.replace(/\s+/g, ' ');
  // Normalizza formati numerici (1.000,50 -> 1000.50)
  normalized = normalized.replace(/(\d+)\.(\d{3}),(\d{1,2})/g, '$1$2.$3');
  // Normalizza anche formato con virgola (1000,50 -> 1000.50)
  normalized = normalized.replace(/(\d+),(\d{1,2})/g, '$1.$2');
  // Normalizza simboli di valuta
  normalized = normalized.replace(/€/g, 'euro');
  normalized = normalized.replace(/\$/g, 'dollari');
  normalized = normalized.replace(/£/g, 'sterline');
  
  return normalized;
}

/**
 * Corregge gli errori di battitura confrontando con i termini noti
 */
export function correctTypos(input: string, knowledgeBase: NlpKnowledgeBase): string {
  let corrected = input;
  const words = input.split(' ');
  
  // Per ogni parola dell'input
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let correctedWord = null;
    
    // Controlla in tutte le categorie di conoscenza
    for (const category of ['expenses', 'investments', 'income', 'incomeIncrease']) {
      const categoryData = knowledgeBase.getCategory(category);
      
      // Controlla nelle variazioni dirette
      if (categoryData.variations[word]) {
        correctedWord = categoryData.variations[word];
        break;
      }
      
      // Controlla nelle sottocategorie se presenti
      if (categoryData.categoriesVariations && 
          categoryData.categoriesVariations[word]) {
        correctedWord = categoryData.categoriesVariations[word];
        break;
      }
      
      // Controlla nelle variazioni degli strumenti se presenti
      if (categoryData.instrumentsVariations && 
          categoryData.instrumentsVariations[word]) {
        correctedWord = categoryData.instrumentsVariations[word];
        break;
      }
      
      // Controlla nelle variazioni delle fonti se presenti
      if (categoryData.sourcesVariations && 
          categoryData.sourcesVariations[word]) {
        correctedWord = categoryData.sourcesVariations[word];
        break;
      }
    }
    
    // Se è stata trovata una correzione, sostituisci la parola
    if (correctedWord) {
      words[i] = correctedWord;
    }
  }
  
  return words.join(' ');
}
