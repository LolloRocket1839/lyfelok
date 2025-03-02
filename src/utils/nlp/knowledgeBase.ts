import { ExpenseItem, DepositItem } from '@/hooks/useLifestyleLock';

// Define the structure of the knowledge base
export interface KnowledgeBase {
  intents: Record<string, string[]>;
  entities: Record<string, string[]>;
  responses: Record<string, string[]>;
  actions: Record<string, string[]>;
  examples: Record<string, string[]>;
}

// Create the knowledge base
export const knowledgeBase: KnowledgeBase = {
  intents: {
    "greeting": [
      "ciao", "salve", "buongiorno", "buonasera", "hey", "hola", 
      "come stai", "come va", "come procede", "come sta andando"
    ],
    "farewell": [
      "arrivederci", "ciao ciao", "a presto", "a dopo", "ci vediamo", 
      "alla prossima", "buona giornata", "buona serata", "addio"
    ],
    "help": [
      "aiuto", "aiutami", "ho bisogno di aiuto", "puoi aiutarmi", 
      "come funziona", "cosa puoi fare", "quali sono le funzionalità",
      "come posso usarti", "cosa sai fare", "dammi informazioni"
    ],
    "add_expense": [
      "aggiungi spesa", "registra spesa", "nuova spesa", "inserisci spesa",
      "ho speso", "ho pagato", "ho comprato", "ho acquistato",
      "registra un acquisto", "aggiungi un costo", "inserisci un pagamento"
    ],
    "add_income": [
      "aggiungi reddito", "registra reddito", "nuovo reddito", "inserisci reddito",
      "ho guadagnato", "ho ricevuto", "mi hanno pagato", "ho incassato",
      "registra un guadagno", "aggiungi un'entrata", "inserisci un incasso"
    ],
    "add_investment": [
      "aggiungi investimento", "registra investimento", "nuovo investimento", "inserisci investimento",
      "ho investito", "ho depositato", "ho messo da parte", "ho risparmiato",
      "registra un deposito", "aggiungi un risparmio", "inserisci un investimento"
    ],
    "view_dashboard": [
      "mostra dashboard", "vai alla dashboard", "apri dashboard", "visualizza dashboard",
      "panoramica", "riassunto", "sommario", "quadro generale",
      "mostra la situazione", "fammi vedere i dati principali"
    ],
    "view_expenses": [
      "mostra spese", "vai alle spese", "apri spese", "visualizza spese",
      "elenco spese", "lista spese", "dettaglio spese", "riepilogo spese",
      "quanto ho speso", "vedi i miei costi"
    ],
    "view_investments": [
      "mostra investimenti", "vai agli investimenti", "apri investimenti", "visualizza investimenti",
      "elenco investimenti", "lista investimenti", "dettaglio investimenti", "riepilogo investimenti",
      "quanto ho investito", "vedi i miei risparmi"
    ],
    "view_projections": [
      "mostra proiezioni", "vai alle proiezioni", "apri proiezioni", "visualizza proiezioni",
      "previsioni future", "andamento futuro", "trend futuro", "stime future",
      "come andrà in futuro", "previsione finanziaria"
    ],
    "budget_info": [
      "informazioni budget", "dettagli budget", "stato budget", "situazione budget",
      "come sto andando col budget", "sto rispettando il budget", "superato budget",
      "budget rimanente", "quanto posso ancora spendere"
    ],
    "financial_advice": [
      "consigli finanziari", "suggerimenti finanziari", "raccomandazioni finanziarie",
      "come posso risparmiare", "come posso investire meglio", "strategie di risparmio",
      "consigli per investire", "come gestire meglio i soldi", "come migliorare le finanze"
    ]
  },
  entities: {
    "expense_category": [
      "alloggio", "affitto", "mutuo", "casa", "bollette", "utenze",
      "cibo", "alimentari", "spesa", "ristorante", "pranzo", "cena",
      "trasporto", "benzina", "carburante", "treno", "bus", "taxi", "auto", "macchina",
      "intrattenimento", "divertimento", "cinema", "teatro", "concerti", "eventi",
      "abbigliamento", "vestiti", "scarpe", "accessori",
      "salute", "medico", "farmacia", "medicine", "terapie",
      "istruzione", "scuola", "università", "corsi", "libri",
      "tecnologia", "elettronica", "computer", "smartphone", "gadget",
      "viaggi", "vacanze", "hotel", "voli", "escursioni"
    ],
    "investment_category": [
      "azioni", "titoli", "borsa", "stock", "equity",
      "obbligazioni", "bond", "titoli di stato", "corporate bond",
      "fondi", "etf", "fondi comuni", "fondi indicizzati",
      "immobili", "real estate", "proprietà", "case", "terreni",
      "crypto", "criptovalute", "bitcoin", "ethereum", "altcoin",
      "oro", "metalli preziosi", "argento", "platino",
      "pensione", "previdenza", "fondo pensione", "pensione integrativa",
      "risparmio", "conto deposito", "liquidità", "cash"
    ],
    "amount": [
      "euro", "€", "eur", "denaro", "soldi", "importo", "cifra", "somma",
      "mille", "duemila", "tremila", "cinquemila", "diecimila",
      "cento", "duecento", "trecento", "cinquecento"
    ],
    "date": [
      "oggi", "ieri", "domani", "settimana scorsa", "mese scorso", "anno scorso",
      "questa settimana", "questo mese", "quest'anno",
      "prossima settimana", "prossimo mese", "prossimo anno",
      "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica",
      "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
      "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
    ],
    "time_period": [
      "giornaliero", "quotidiano", "al giorno", "ogni giorno",
      "settimanale", "ogni settimana", "a settimana",
      "mensile", "ogni mese", "al mese", "mensili",
      "annuale", "ogni anno", "all'anno", "annuali",
      "trimestrale", "ogni trimestre", "al trimestre",
      "semestrale", "ogni semestre", "al semestre"
    ]
  },
  responses: {
    "greeting": [
      "Ciao! Come posso aiutarti con le tue finanze oggi?",
      "Salve! Sono qui per aiutarti a gestire il tuo denaro. Cosa ti serve?",
      "Buongiorno! Sono il tuo assistente finanziario. Come posso esserti utile?",
      "Ciao! Sono qui per aiutarti con budget, spese e investimenti. Cosa vorresti fare?"
    ],
    "farewell": [
      "Arrivederci! Torna quando hai bisogno di gestire le tue finanze.",
      "Ciao ciao! Sono qui se hai bisogno di aiuto con il tuo denaro.",
      "A presto! Continua a gestire saggiamente le tue finanze.",
      "Alla prossima! Ricorda di tenere traccia delle tue spese."
    ],
    "help": [
      "Posso aiutarti a gestire le tue finanze personali. Puoi chiedermi di registrare spese, visualizzare il tuo budget, aggiungere investimenti o vedere proiezioni future.",
      "Sono il tuo assistente finanziario. Posso aiutarti a tenere traccia delle spese, gestire investimenti e monitorare il tuo budget. Cosa ti serve sapere?",
      "Ecco cosa posso fare: registrare spese e redditi, mostrare il tuo budget attuale, gestire i tuoi investimenti e fare proiezioni future. Come posso aiutarti oggi?"
    ],
    "add_expense": [
      "Certamente! Che tipo di spesa vuoi registrare?",
      "Posso aiutarti ad aggiungere una spesa. Di che categoria si tratta e quanto hai speso?",
      "Registriamo questa spesa. Puoi dirmi categoria, importo e data?",
      "Aggiungiamo questa spesa al tuo budget. Mi servono categoria e importo."
    ],
    "add_income": [
      "Ottimo! Registriamo questo reddito. Puoi dirmi l'importo e la data?",
      "Aggiungiamo questa entrata. Di che importo si tratta?",
      "Bene! Aggiungiamo questo reddito al tuo bilancio. Quanto hai guadagnato?",
      "Registriamo questo guadagno. Mi serve l'importo e quando l'hai ricevuto."
    ],
    "add_investment": [
      "Ottima scelta investire! In quale categoria hai investito e quanto?",
      "Registriamo questo investimento. Puoi dirmi tipo, importo e data?",
      "Aggiungiamo questo investimento al tuo portafoglio. Di che tipo è e quanto hai investito?",
      "Bene! Registriamo questo investimento. Mi servono categoria e importo."
    ],
    "view_dashboard": [
      "Ecco la tua dashboard con la panoramica delle tue finanze.",
      "Ti mostro il quadro generale delle tue finanze nella dashboard.",
      "Ecco il riassunto della tua situazione finanziaria attuale.",
      "Questa è la panoramica delle tue finanze. Puoi vedere budget, spese e investimenti."
    ],
    "view_expenses": [
      "Ecco l'elenco delle tue spese recenti.",
      "Ti mostro il dettaglio delle tue spese.",
      "Queste sono le tue spese registrate finora.",
      "Ecco come hai speso i tuoi soldi recentemente."
    ],
    "view_investments": [
      "Ecco il dettaglio dei tuoi investimenti.",
      "Ti mostro il tuo portafoglio investimenti.",
      "Questi sono i tuoi investimenti attuali.",
      "Ecco come hai allocato i tuoi risparmi negli investimenti."
    ],
    "view_projections": [
      "Ecco le proiezioni future basate sulle tue abitudini finanziarie attuali.",
      "Ti mostro come potrebbero evolversi le tue finanze in futuro.",
      "Queste sono le previsioni per la tua situazione finanziaria futura.",
      "Ecco come potrebbe crescere il tuo patrimonio nei prossimi anni."
    ],
    "budget_info": [
      "Il tuo budget mensile è di €{budget_amount}. Finora hai speso €{spent_amount}, quindi ti restano €{remaining_amount}.",
      "Questo mese hai un budget di €{budget_amount} e hai speso €{spent_amount}. Sei al {percentage}% del tuo budget.",
      "Hai speso €{spent_amount} del tuo budget mensile di €{budget_amount}. Ti restano €{remaining_amount} da spendere.",
      "La tua situazione di budget: €{spent_amount} spesi su €{budget_amount} disponibili. {status_message}"
    ],
    "financial_advice": [
      "Basandomi sulle tue abitudini di spesa, ti consiglio di ridurre le spese in {high_category} e investire di più in {recommended_investment}.",
      "Per migliorare le tue finanze, considera di aumentare i tuoi risparmi del {savings_percentage}% e ridurre le spese discrezionali.",
      "Un consiglio: cerca di mantenere le spese essenziali sotto il 50% del tuo reddito e aumenta i tuoi investimenti a lungo termine.",
      "Per ottimizzare le tue finanze, punta a risparmiare almeno il 20% del tuo reddito e diversifica i tuoi investimenti tra {investment_options}."
    ],
    "fallback": [
      "Mi dispiace, non ho capito. Puoi ripetere in modo diverso?",
      "Non sono sicuro di aver compreso. Puoi spiegare meglio cosa vorresti fare?",
      "Non ho capito completamente. Posso aiutarti con spese, budget o investimenti.",
      "Scusa, non ho afferrato. Prova a chiedere in un altro modo o chiedi aiuto per vedere cosa posso fare."
    ]
  },
  actions: {
    "navigate_to": [
      "dashboard", "expenses", "investments", "projections", "settings"
    ],
    "open_modal": [
      "add_expense", "add_income", "add_investment", "edit_expense", "edit_investment"
    ],
    "calculate": [
      "budget_status", "investment_growth", "savings_rate", "expense_breakdown"
    ],
    "generate": [
      "financial_report", "spending_analysis", "investment_advice", "savings_plan"
    ]
  },
  examples: {
    "add_expense": [
      "Ho speso 50 euro per la cena ieri",
      "Aggiungi una spesa di 120 euro per l'affitto",
      "Registra 35 euro di spesa per benzina oggi",
      "Ho comprato vestiti per 80 euro"
    ],
    "add_income": [
      "Ho ricevuto lo stipendio di 1500 euro",
      "Aggiungi un'entrata di 200 euro per un lavoro freelance",
      "Ho guadagnato 50 euro vendendo oggetti usati",
      "Registra un bonus di 300 euro"
    ],
    "add_investment": [
      "Ho investito 500 euro in azioni",
      "Aggiungi un investimento di 1000 euro in fondi",
      "Ho messo 200 euro nel fondo pensione",
      "Registra un deposito di 300 euro nel conto risparmio"
    ],
    "view_dashboard": [
      "Mostrami la dashboard",
      "Voglio vedere la panoramica",
      "Apri la schermata principale",
      "Fammi vedere il riassunto delle mie finanze"
    ],
    "view_expenses": [
      "Mostrami le mie spese",
      "Voglio vedere quanto ho speso",
      "Apri l'elenco delle spese",
      "Fammi vedere i miei costi recenti"
    ]
  }
};

// Function to extract entities from user input
export function extractEntities(input: string, entityType: keyof KnowledgeBase['entities']) {
  const entities = knowledgeBase.entities[entityType];
  return entities.filter(entity => input.toLowerCase().includes(entity.toLowerCase()));
}

// Function to identify intent from user input
export function identifyIntent(input: string): string {
  const inputLower = input.toLowerCase();
  let highestScore = 0;
  let matchedIntent = "fallback";

  Object.entries(knowledgeBase.intents).forEach(([intent, phrases]) => {
    phrases.forEach(phrase => {
      if (inputLower.includes(phrase.toLowerCase())) {
        const score = phrase.length / inputLower.length;
        if (score > highestScore) {
          highestScore = score;
          matchedIntent = intent;
        }
      }
    });
  });

  return matchedIntent;
}

// Function to get a random response for a given intent
export function getResponse(intent: string): string {
  const responses = knowledgeBase.responses[intent] || knowledgeBase.responses.fallback;
  return responses[Math.floor(Math.random() * responses.length)];
}

// Function to extract amount from user input
export function extractAmount(input: string): number | null {
  const amountRegex = /(\d+([.,]\d+)?)\s*(euro|€|eur)/i;
  const match = input.match(amountRegex);
  
  if (match && match[1]) {
    // Replace comma with dot for proper parsing
    const normalizedAmount = match[1].replace(',', '.');
    return parseFloat(normalizedAmount);
  }
  
  return null;
}

// Function to extract date from user input
export function extractDate(input: string): string | null {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (input.toLowerCase().includes('oggi')) {
    return today.toISOString().split('T')[0];
  } else if (input.toLowerCase().includes('ieri')) {
    return yesterday.toISOString().split('T')[0];
  }
  
  // More complex date extraction would go here
  
  return null;
}

// Function to extract expense information
export function extractExpenseInfo(input: string): Partial<ExpenseItem> {
  const expenseInfo: Partial<ExpenseItem> = {};
  
  // Extract category
  const categories = extractEntities(input, 'expense_category');
  if (categories.length > 0) {
    expenseInfo.category = categories[0];
  }
  
  // Extract amount
  const amount = extractAmount(input);
  if (amount !== null) {
    expenseInfo.spent = amount;
    // Assume baseline is the same as spent for now
    expenseInfo.baseline = amount;
  }
  
  // Extract date
  const date = extractDate(input);
  if (date) {
    expenseInfo.date = date;
  }
  
  return expenseInfo;
}

// Function to extract investment information
export function extractInvestmentInfo(input: string): Partial<DepositItem> {
  const investmentInfo: Partial<DepositItem> = {};
  
  // Extract category
  const categories = extractEntities(input, 'investment_category');
  if (categories.length > 0) {
    investmentInfo.category = categories[0];
  }
  
  // Extract amount
  const amount = extractAmount(input);
  if (amount !== null) {
    investmentInfo.amount = amount;
  }
  
  // Extract date
  const date = extractDate(input);
  if (date) {
    investmentInfo.date = date;
  }
  
  // Extract description (simple approach)
  const words = input.split(' ');
  if (words.length > 3) {
    investmentInfo.description = input;
  }
  
  return investmentInfo;
}
