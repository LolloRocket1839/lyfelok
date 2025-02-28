
// Funzione per analizzare il testo e determinare il tipo di transazione, importo, ecc.
export function analyzeText(text: string) {
  const lowerText = text.toLowerCase();
  
  // Oggetto risultato predefinito
  let result = {
    type: 'spesa', // Default a spesa
    amount: 0,
    category: 'Altro',
    date: new Date().toISOString().split('T')[0], // Data odierna
    baselineAmount: 0, // Per le spese, sarà uguale all'amount come valore predefinito
    confidence: 'medium' as 'high' | 'medium' | 'low'
  };
  
  // Determina il tipo di transazione
  if (lowerText.includes('spes') || lowerText.includes('pagat') || lowerText.includes('comprat')) {
    result.type = 'spesa';
  } else if (lowerText.includes('investit') || lowerText.includes('eth') || 
            lowerText.includes('azioni') || lowerText.includes('bond') || 
            lowerText.includes('obbligaz') || lowerText.includes('crypto')) {
    result.type = 'investimento';
  } else if (lowerText.includes('ricevut') || lowerText.includes('stipendio') || 
            lowerText.includes('entrat') || lowerText.includes('guadagnat')) {
    result.type = 'entrata';
  }
  
  // Estrai importo (cerca pattern come "25€", "€25", "25 euro")
  const amountPatterns = [
    /(\d+[.,]?\d*)[ ]?[€$]/g,      // 25€, 25.50€
    /[€$][ ]?(\d+[.,]?\d*)/g,      // €25, € 25.50
    /(\d+[.,]?\d*)[ ]?euro/gi      // 25 euro
  ];
  
  let amountMatch = null;
  for (const pattern of amountPatterns) {
    const matches = [...lowerText.matchAll(pattern)];
    if (matches.length > 0) {
      amountMatch = matches[0][1];
      break;
    }
  }
  
  if (amountMatch) {
    result.amount = parseFloat(amountMatch.replace(',', '.'));
  }
  
  // Determina categoria in base al tipo
  if (result.type === 'spesa') {
    // Categorie di spesa
    if (lowerText.includes('ristorante') || lowerText.includes('cena') || 
        lowerText.includes('pranzo') || lowerText.includes('caffè') || 
        lowerText.includes('cafe') || lowerText.includes('supermercato') ||
        lowerText.includes('cibo')) {
      result.category = 'Cibo';
    } else if (lowerText.includes('affitto') || lowerText.includes('mutuo') || 
              lowerText.includes('bolletta')) {
      result.category = 'Alloggio';
    } else if (lowerText.includes('benzina') || lowerText.includes('treno') || 
              lowerText.includes('bus') || lowerText.includes('metro') || 
              lowerText.includes('uber') || lowerText.includes('taxi')) {
      result.category = 'Trasporto';
    } else if (lowerText.includes('cinema') || lowerText.includes('concerto') || 
              lowerText.includes('netflix') || lowerText.includes('spotify')) {
      result.category = 'Intrattenimento';
    } else {
      result.category = 'Altro';
    }
  } else if (result.type === 'investimento') {
    // Categorie di investimento
    if (lowerText.includes('etf') || lowerText.includes('msci')) {
      result.category = 'ETF';
    } else if (lowerText.includes('azioni') || lowerText.includes('azion')) {
      result.category = 'Azioni';
    } else if (lowerText.includes('bond') || lowerText.includes('obbligaz')) {
      result.category = 'Obbligazioni';
    } else if (lowerText.includes('crypto') || lowerText.includes('bitcoin')) {
      result.category = 'Crypto';
    } else {
      result.category = 'Altro';
    }
  } else if (result.type === 'entrata') {
    // Categorie di entrata
    if (lowerText.includes('stipendio') || lowerText.includes('salario')) {
      result.category = 'Stipendio';
    } else if (lowerText.includes('bonus') || lowerText.includes('premio')) {
      result.category = 'Bonus';
    } else if (lowerText.includes('dividend')) {
      result.category = 'Dividendi';
    } else {
      result.category = 'Altra entrata';
    }
  }
  
  // Imposta il baselineAmount uguale all'amount per le spese
  if (result.type === 'spesa') {
    result.baselineAmount = result.amount;
  }
  
  // Determina la confidenza dell'interpretazione
  let confidenceScore = 0;
  if (result.type) confidenceScore += 1;
  if (result.amount > 0) confidenceScore += 1;
  if (result.category !== 'Altro') confidenceScore += 1;
  
  if (confidenceScore >= 3) {
    result.confidence = 'high';
  } else if (confidenceScore === 2) {
    result.confidence = 'medium';
  } else {
    result.confidence = 'low';
  }
  
  return result;
}
