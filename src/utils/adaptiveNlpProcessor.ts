
import { supabase } from '@/lib/supabase';

// Importazione diretta del modulo nlpProcessor
import * as nlpProcessorModule from './nlpProcessor';

// Interfaccia per i risultati dell'analisi
export interface NlpAnalysisResult {
  type: 'spesa' | 'entrata' | 'investimento';
  amount: number;
  category: string;
  date: string;
  baselineAmount: number;
  confidence: 'high' | 'medium' | 'low';
  unknownWords?: string[];
  needsFeedback?: boolean;
}

// Interfaccia per feedback in attesa
interface PendingFeedback {
  [word: string]: {
    guessedCategory: string;
    confidence: number;
    context: string[];
    timestamp: number;
  }
}

// Mappatura di parole a categorie con pesi
interface WordCategoryMapping {
  [word: string]: {
    [category: string]: number;
  }
}

// Classe principale per l'analisi NLP adattiva
export class AdaptiveNlpProcessor {
  private userId: string | null = null;
  private wordCategoryMapping: WordCategoryMapping = {};
  private pendingFeedback: PendingFeedback = {};
  private confidenceThreshold = 0.7;
  private initialized = false;

  constructor() {
    // Carica dal localStorage al momento dell'inizializzazione
    this.loadFromLocalStorage();
  }

  // Imposta l'ID utente per sincronizzazione con Supabase (in futuro)
  public setUserId(userId: string) {
    this.userId = userId;
    // In futuro, qui caricare i dati da Supabase
  }

  // Inizializza o reinizializza il processore
  public initialize() {
    this.loadFromLocalStorage();
    this.initialized = true;
    return this;
  }

  // Memorizza le mappature in localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem('adaptiveNlpMapping', JSON.stringify(this.wordCategoryMapping));
      localStorage.setItem('adaptiveNlpPendingFeedback', JSON.stringify(this.pendingFeedback));
      localStorage.setItem('adaptiveNlpConfidenceThreshold', this.confidenceThreshold.toString());
    } catch (error) {
      console.error('Errore nel salvataggio delle mappature NLP:', error);
    }
  }

  // Carica le mappature da localStorage
  private loadFromLocalStorage() {
    try {
      const mapping = localStorage.getItem('adaptiveNlpMapping');
      const pending = localStorage.getItem('adaptiveNlpPendingFeedback');
      const threshold = localStorage.getItem('adaptiveNlpConfidenceThreshold');

      if (mapping) this.wordCategoryMapping = JSON.parse(mapping);
      if (pending) this.pendingFeedback = JSON.parse(pending);
      if (threshold) this.confidenceThreshold = parseFloat(threshold);
    } catch (error) {
      console.error('Errore nel caricamento delle mappature NLP:', error);
    }
  }

  // Analizza il testo usando sia l'elaborazione di base che quella adattiva
  public analyzeText(text: string): NlpAnalysisResult {
    if (!this.initialized) {
      this.initialize();
    }

    // Analisi con l'elaboratore di base
    const baseResult = this.getBaseAnalysis(text);
    
    // Assicuriamoci che baseResult.type sia uno dei tipi validi
    let validType: 'spesa' | 'entrata' | 'investimento';
    if (baseResult.type === 'spesa' || baseResult.type === 'entrata' || baseResult.type === 'investimento') {
      validType = baseResult.type;
    } else {
      // Default a 'spesa' se il tipo non è valido
      validType = 'spesa';
      console.warn(`Tipo non valido: ${baseResult.type}. Utilizzo 'spesa' come default.`);
    }
    
    // Tokenizza il testo per analisi avanzata
    const tokens = this.tokenize(text);
    
    // Trova parole sconosciute e categorie potenziali
    const unknownWords: string[] = [];
    const guessedCategories: {[category: string]: number} = {};
    
    // Analizza ogni token
    for (const token of tokens) {
      // Ignora stopwords, numeri e token troppo corti
      if (this.isStopword(token) || this.isNumber(token) || token.length < 3) {
        continue;
      }
      
      // Controlla se è una parola conosciuta
      if (this.wordCategoryMapping[token]) {
        // Parola conosciuta, usa le categorie associate
        const categories = this.wordCategoryMapping[token];
        
        for (const category in categories) {
          if (!guessedCategories[category]) {
            guessedCategories[category] = 0;
          }
          // Aggiungi il peso di questa parola per la categoria
          guessedCategories[category] += categories[category];
        }
      } else {
        // Parola sconosciuta, la aggiungiamo alla lista
        unknownWords.push(token);
        
        // Proviamo a indovinare la categoria
        const guessResult = this.guessCategory(token, tokens);
        
        // Aggiungi le categorie indovinate con i loro punteggi
        for (const category in guessResult.categoryScores) {
          if (!guessedCategories[category]) {
            guessedCategories[category] = 0;
          }
          guessedCategories[category] += guessResult.categoryScores[category];
        }
        
        // Se la confidenza è bassa, segnaliamo che serve feedback
        if (guessResult.confidence < this.confidenceThreshold) {
          this.pendingFeedback[token] = {
            guessedCategory: guessResult.bestCategory || baseResult.category,
            confidence: guessResult.confidence,
            context: tokens.slice(),
            timestamp: Date.now()
          };
          
          // Salva le modifiche
          this.saveToLocalStorage();
        }
      }
    }
    
    // Trova la categoria con il punteggio più alto dal sistema adattivo
    let bestAdaptiveCategory = '';
    let bestAdaptiveScore = 0;
    
    for (const category in guessedCategories) {
      if (guessedCategories[category] > bestAdaptiveScore) {
        bestAdaptiveScore = guessedCategories[category];
        bestAdaptiveCategory = category;
      }
    }
    
    // Combina i risultati con quelli di base, dando priorità all'analisi adattiva
    // se ha confidenza sufficiente
    const result: NlpAnalysisResult = {
      type: validType,
      amount: baseResult.amount,
      category: baseResult.category,
      date: baseResult.date,
      baselineAmount: baseResult.baselineAmount,
      confidence: baseResult.confidence,
      unknownWords,
      needsFeedback: unknownWords.length > 0
    };
    
    // Se abbiamo una categoria con alto punteggio adattivo, diamo priorità ad essa
    if (bestAdaptiveScore > 1) {
      result.category = bestAdaptiveCategory;
      
      // Modifica anche la confidenza se necessario
      if (bestAdaptiveScore > 2) {
        result.confidence = 'high';
      } else if (bestAdaptiveScore > 1) {
        result.confidence = 'medium';
      }
    }
    
    return result;
  }

  // Ottieni l'analisi di base dal nlpProcessor esistente
  private getBaseAnalysis(text: string) {
    // Utilizziamo l'importazione diretta invece di require
    return nlpProcessorModule.analyzeText(text);
  }

  // Tenta di indovinare la categoria di una parola sconosciuta
  private guessCategory(word: string, context: string[]) {
    const result = {
      word,
      categoryScores: {} as {[category: string]: number},
      bestCategory: null as string | null,
      confidence: 0
    };
    
    // 1. Analisi morfologica (prefissi, suffissi)
    const morphScores = this.analyzeMorphology(word);
    
    // 2. Analisi contestuale (parole che appaiono insieme)
    const contextScores = this.analyzeContext(word, context);
    
    // 3. Analisi di similarità lessicale (parole simili note)
    const similarityScores = this.analyzeSimilarity(word);
    
    // Combina i punteggi dai diversi metodi
    const allCategories = new Set([
      ...Object.keys(morphScores),
      ...Object.keys(contextScores),
      ...Object.keys(similarityScores)
    ]);
    
    // Pesi relativi dei diversi metodi
    const MORPH_WEIGHT = 0.3;
    const CONTEXT_WEIGHT = 0.5;
    const SIMILARITY_WEIGHT = 0.2;
    
    // Calcola punteggio combinato per ogni categoria
    for (const category of allCategories) {
      const morphScore = morphScores[category] || 0;
      const contextScore = contextScores[category] || 0;
      const similarityScore = similarityScores[category] || 0;
      
      result.categoryScores[category] = 
        (morphScore * MORPH_WEIGHT) + 
        (contextScore * CONTEXT_WEIGHT) + 
        (similarityScore * SIMILARITY_WEIGHT);
    }
    
    // Trova la categoria con il punteggio maggiore
    let bestScore = 0;
    for (const category in result.categoryScores) {
      if (result.categoryScores[category] > bestScore) {
        bestScore = result.categoryScores[category];
        result.bestCategory = category;
      }
    }
    
    // La confidenza è proporzionale al punteggio
    result.confidence = bestScore;
    
    return result;
  }

  // Analizza morfologia (prefissi/suffissi)
  private analyzeMorphology(word: string) {
    const categoryScores: {[category: string]: number} = {};
    
    // Lista di prefissi e suffissi comuni per le categorie finanziarie
    const morphemes: {[morpheme: string]: {[category: string]: number}} = {
      'invest': { 'Investimento': 0.8 },
      'azion': { 'Azioni': 0.9 },
      'obblig': { 'Obbligazioni': 0.9 },
      'fond': { 'Fondi': 0.7 },
      'etf': { 'ETF': 0.95 },
      'crypt': { 'Crypto': 0.9 },
      'bitcoin': { 'Crypto': 0.95 },
      'rimbors': { 'Entrata': 0.7 },
      'stip': { 'Stipendio': 0.9 },
      'salar': { 'Stipendio': 0.8 },
      'divid': { 'Dividendi': 0.9 },
      'spesa': { 'Spese': 0.8 },
      'spese': { 'Spese': 0.9 },
      'speso': { 'Spese': 0.9 },
      'pagat': { 'Spese': 0.8 },
      'compra': { 'Spese': 0.7, 'Investimento': 0.3 },
      'bolletta': { 'Alloggio': 0.8 },
      'mutuo': { 'Alloggio': 0.9 },
      'affitt': { 'Alloggio': 0.9 },
      'cibo': { 'Cibo': 0.95 },
      'ristora': { 'Cibo': 0.9 },
      'pranzo': { 'Cibo': 0.9 },
      'cena': { 'Cibo': 0.9 },
      'colazio': { 'Cibo': 0.9 },
      'benzina': { 'Trasporto': 0.9 },
      'treno': { 'Trasporto': 0.9 },
      'cinema': { 'Intrattenimento': 0.9 },
      'medic': { 'Salute': 0.9 },
      'farmac': { 'Salute': 0.9 },
      'telefon': { 'Tecnologia': 0.8 },
      'smartph': { 'Tecnologia': 0.9 }
    };
    
    // Controlla se la parola contiene morfemi 
    for (const morpheme in morphemes) {
      if (word.includes(morpheme)) {
        for (const category in morphemes[morpheme]) {
          if (!categoryScores[category]) {
            categoryScores[category] = 0;
          }
          categoryScores[category] += morphemes[morpheme][category];
        }
      }
    }
    
    return categoryScores;
  }

  // Analizza il contesto in cui appare la parola
  private analyzeContext(word: string, context: string[]) {
    const categoryScores: {[category: string]: number} = {};
    
    // Finestra di contesto (quante parole consideriamo intorno alla parola target)
    const windowSize = 3;
    
    // Trova l'indice della parola nel contesto
    const wordIndex = context.indexOf(word);
    if (wordIndex === -1) return categoryScores;
    
    // Estrai parole di contesto (finestra intorno alla parola target)
    const start = Math.max(0, wordIndex - windowSize);
    const end = Math.min(context.length, wordIndex + windowSize + 1);
    const contextWindow = [
      ...context.slice(start, wordIndex),
      ...context.slice(wordIndex + 1, end)
    ];
    
    // Analizza il punteggio di ciascuna parola di contesto per categoria
    for (const contextWord of contextWindow) {
      // Ignora stopwords, numeri e token troppo corti
      if (this.isStopword(contextWord) || this.isNumber(contextWord) || contextWord.length < 3) {
        continue;
      }
      
      // Controlla se è una parola conosciuta nel nostro modello
      if (this.wordCategoryMapping[contextWord]) {
        const categories = this.wordCategoryMapping[contextWord];
        for (const category in categories) {
          if (!categoryScores[category]) {
            categoryScores[category] = 0;
          }
          
          // Pesa il contributo in base alla distanza dalla parola target
          const distance = Math.abs(context.indexOf(contextWord) - wordIndex);
          const distanceWeight = 1 - (distance / (windowSize + 1));
          
          categoryScores[category] += categories[category] * distanceWeight;
        }
      }
    }
    
    return categoryScores;
  }

  // Analizza la similarità lessicale con parole note
  private analyzeSimilarity(word: string) {
    const categoryScores: {[category: string]: number} = {};
    
    // Ottieni tutte le parole note
    const knownWordsList = Object.keys(this.wordCategoryMapping);
    
    // Trova parole simili usando la distanza di Levenshtein
    const similarWords = this.findSimilarWords(word, knownWordsList);
    
    // Somma i punteggi dalle parole simili, pesati per similarità
    for (const similarWord of similarWords) {
      const categories = this.wordCategoryMapping[similarWord.word] || {};
      
      for (const category in categories) {
        if (!categoryScores[category]) {
          categoryScores[category] = 0;
        }
        // Peso il contributo in base alla similarità
        categoryScores[category] += categories[category] * similarWord.similarity;
      }
    }
    
    return categoryScores;
  }

  // Trova parole simili usando distanza di Levenshtein normalizzata
  private findSimilarWords(word: string, wordList: string[], limit = 5, threshold = 0.7) {
    const similarities: {word: string, similarity: number}[] = [];
    
    for (const knownWord of wordList) {
      // Non confrontare con la stessa parola
      if (knownWord === word) continue;
      
      // Calcola la similarità (1 - distanza normalizzata)
      const similarity = this.calculateSimilarity(word, knownWord);
      
      // Aggiungi solo se sopra la soglia
      if (similarity >= threshold) {
        similarities.push({
          word: knownWord,
          similarity: similarity
        });
      }
    }
    
    // Ordina per similarità decrescente e limita il numero di risultati
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Calcola similarità tra due stringhe
  private calculateSimilarity(str1: string, str2: string) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  // Calcola distanza di Levenshtein
  private levenshteinDistance(str1: string, str2: string) {
    const m = str1.length;
    const n = str2.length;
    
    // Matrice di distanze
    const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Inizializza la prima riga e colonna
    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;
    
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= m; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,      // eliminazione
          d[i][j - 1] + 1,      // inserimento
          d[i - 1][j - 1] + cost // sostituzione
        );
      }
    }
    
    return d[m][n];
  }

  // Processa feedback per migliorare il sistema
  public processFeedback(word: string, suggestedCategory: string, isCorrect: boolean, correctCategory?: string) {
    // Verifica se abbiamo questa parola in attesa di feedback
    const pendingInfo = this.pendingFeedback[word];
    if (!pendingInfo) {
      console.warn(`Nessun feedback in attesa per la parola: ${word}`);
      return false;
    }
    
    // Determina la categoria da apprendere
    const targetCategory = isCorrect ? suggestedCategory : (correctCategory || '');
    
    // Se non abbiamo una categoria corretta, non possiamo procedere
    if (!isCorrect && !targetCategory) {
      console.warn("Feedback negativo ricevuto senza categoria corretta");
      return false;
    }
    
    // Inizializza la mappatura per questa parola se non esiste
    if (!this.wordCategoryMapping[word]) {
      this.wordCategoryMapping[word] = {};
    }
    
    // Aggiorna i pesi per questa parola
    if (isCorrect) {
      // Feedback positivo: rafforza la categoria suggerita
      this.wordCategoryMapping[word][targetCategory] = 
        (this.wordCategoryMapping[word][targetCategory] || 0) + 0.3;
      
      // Normalizza i pesi per assicurare che sommino a 1
      this.normalizeWeights(this.wordCategoryMapping[word]);
    } else if (targetCategory) {
      // Feedback negativo: penalizza la categoria errata e aumenta quella corretta
      this.wordCategoryMapping[word][suggestedCategory] = 
        Math.max(0, (this.wordCategoryMapping[word][suggestedCategory] || 0) - 0.2);
      
      this.wordCategoryMapping[word][targetCategory] = 
        (this.wordCategoryMapping[word][targetCategory] || 0) + 0.3;
      
      // Normalizza i pesi
      this.normalizeWeights(this.wordCategoryMapping[word]);
    }
    
    // Rimuovi la parola dalla lista in attesa di feedback
    delete this.pendingFeedback[word];
    
    // Salva le modifiche
    this.saveToLocalStorage();
    
    // In futuro, qui sincronizzare con Supabase
    if (this.userId) {
      // TODO: Sincronizzare con il database
    }
    
    return true;
  }

  // Normalizza i pesi delle categorie
  private normalizeWeights(categoryWeights: {[category: string]: number}) {
    // Calcola la somma dei pesi
    const sum = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
    
    // Se la somma è 0, non possiamo normalizzare
    if (sum === 0) return;
    
    // Normalizza ogni peso
    for (const category in categoryWeights) {
      categoryWeights[category] /= sum;
    }
  }

  // Ottieni le parole che necessitano di feedback
  public getPendingFeedbackWords() {
    const pendingWords = [];
    
    for (const word in this.pendingFeedback) {
      pendingWords.push({
        word,
        guessedCategory: this.pendingFeedback[word].guessedCategory,
        confidence: this.pendingFeedback[word].confidence
      });
    }
    
    return pendingWords;
  }

  // Tokenizza un testo in parole
  private tokenize(text: string) {
    // Rimuovi punteggiatura e caratteri speciali, converti in minuscolo
    const cleanText = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
      .replace(/\s{2,}/g, " ");
    
    // Dividi in token
    return cleanText.split(' ').filter(token => token.length > 0);
  }

  // Verifica se una parola è una stopword
  private isStopword(word: string) {
    const stopwords = ["a", "al", "alla", "allo", "ai", "agli", "alle", "e", "ed", "i", "il", "in", "la", "le", 
                      "lo", "gli", "da", "dal", "dalla", "dallo", "dai", "dagli", "dalle", "di", "del", "della", 
                      "dello", "dei", "degli", "delle", "che", "chi", "cui", "non", "come", "dove", "quale", 
                      "quali", "quando", "quanto", "quanta", "quanti", "quante", "quello", "quella", "quelli", 
                      "quelle", "questo", "questa", "questi", "queste", "si", "no", "se", "perché", "anche", 
                      "me", "te", "noi", "voi", "lui", "lei", "loro", "mio", "mia", "miei", "mie", "tuo", "tua", 
                      "tuoi", "tue", "suo", "sua", "suoi", "sue", "nostro", "nostra", "nostri", "nostre", "vostro", 
                      "vostra", "vostri", "vostre", "mi", "ti", "ci", "vi", "lo", "la", "li", "le", "ne", "con", 
                      "senza", "per", "tra", "fra", "o", "ho", "hai", "ha", "abbiamo", "avete", "hanno", "è", "sono"];
    
    return stopwords.includes(word);
  }

  // Verifica se un token è un numero
  private isNumber(token: string) {
    return !isNaN(Number(token)) || !isNaN(Number(token.replace(',', '.')));
  }
}

// Singola istanza condivisa del processore
const nlpProcessor = new AdaptiveNlpProcessor();
export default nlpProcessor;
