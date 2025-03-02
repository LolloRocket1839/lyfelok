
import { KnowledgeBaseData } from './types';

export class NlpKnowledgeBase {
  private data: KnowledgeBaseData;
  
  constructor() {
    // Database di conoscenza finanziaria
    this.data = {
      // Termini relativi alle SPESE con possibili errori di battitura
      expenses: {
        base: ['spesa', 'pagato', 'comprato', 'acquistato', 'costo', 'uscita'],
        variations: {
          'spsa': 'spesa', 'speza': 'spesa', 'spessa': 'spesa',
          'pagto': 'pagato', 'paggato': 'pagato', 'paghato': 'pagato',
          'conprato': 'comprato', 'comprao': 'comprato', 'comperato': 'comprato',
          'acquistao': 'acquistato', 'acquistto': 'acquistato', 'aquistat': 'acquistato',
          'costo': 'costo', 'coto': 'costo', 'cst': 'costo',
          'uscta': 'uscita', 'usita': 'uscita', 'uscit': 'uscita'
        },
        categories: {
          'cibo': ['pizza', 'ristorante', 'pranzo', 'cena', 'supermercato', 'spesa', 'bar', 'caffè', 'gelato', 'panino'],
          'casa': ['affitto', 'mutuo', 'bolletta', 'luce', 'gas', 'acqua', 'wifi', 'condominio', 'riparazione'],
          'trasporti': ['benzina', 'carburante', 'treno', 'bus', 'metro', 'taxi', 'uber', 'aereo', 'biglietto'],
          'intrattenimento': ['cinema', 'teatro', 'concerto', 'netflix', 'spotify', 'disney', 'abbonamento', 'videogioco'],
          'salute': ['farmacia', 'medico', 'dottore', 'visita', 'esame', 'analisi', 'dentista', 'terapia', 'palestra'],
          'abbigliamento': ['vestiti', 'scarpe', 'giacca', 'pantaloni', 'camicia', 'maglia', 'jeans', 'cappotto']
        },
        categoriesVariations: {
          "cibo": ["food", "groceries", "cibo", "alimentari", "supermercato", "spesa", "pranzo", "cena", "colazione", "pizza", "ristorante"],
          "trasporti": ["transport", "travel", "trasporti", "trasporto", "treno", "metro", "bus", "taxi", "uber", "carburante", "benzina", "gasolio", "autostrada", "pedaggio"],
          "casa": ["house", "home", "casa", "affitto", "mutuo", "bollette", "condominio", "arredamento", "manutenzione"],
          "salute": ["health", "medical", "salute", "medico", "farmacia", "dottore", "dentista", "terapia", "visita"],
          "intrattenimento": ["entertainment", "leisure", "intrattenimento", "svago", "divertimento", "cinema", "teatro", "concerto", "hobby", "streaming", "abbonamento"],
          "educazione": ["education", "learning", "educazione", "formazione", "corso", "università", "libri", "studio"],
          "abbigliamento": ["clothing", "abbigliamento", "vestiti", "scarpe", "accessori", "moda"],
          "tecnologia": ["technology", "tech", "tecnologia", "elettronica", "dispositivi", "computer", "smartphone", "gadget"],
          "varie": ["other", "misc", "varie", "extra"]
        }
      },
      
      // Termini relativi agli INVESTIMENTI con possibili errori di battitura
      investments: {
        base: ['investito', 'investimento', 'depositato', 'risparmiato', 'messo', 'comprato'],
        variations: {
          'invstito': 'investito', 'investio': 'investito', 'ivestito': 'investito',
          'investimeno': 'investimento', 'invstimento': 'investimento', 'investmento': 'investimento',
          'depstato': 'depositato', 'depositao': 'depositato', 'depostato': 'depositato',
          'risparmato': 'risparmiato', 'risparmito': 'risparmito', 'rispariato': 'rispariato',
          'mess': 'messo', 'meso': 'messo', 'mezzo': 'messo'
        },
        instruments: {
          'azioni': ['azione', 'azioni', 'titolo', 'titoli', 'borsa', 'azionario'],
          'etf': ['etf', 'fondo', 'index', 'indice', 'indicizzato', 'vanguard', 'ishares', 'lyxor'],
          'crypto': ['bitcoin', 'ethereum', 'crypto', 'criptovaluta', 'btc', 'eth', 'altcoin'],
          'obbligazioni': ['obbligazione', 'bond', 'btp', 'cct', 'buono', 'tesoro', 'governativo'],
          'immobiliare': ['immobile', 'casa', 'terreno', 'reit', 'affitto', 'rent', 'noleggio'],
          'liquidità': ['conto', 'deposito', 'liquidità', 'risparmio', 'cd', 'certificato', 'bancario']
        },
        instrumentsVariations: {
          'azone': 'azione', 'azzione': 'azione', 'titol': 'titolo',
          'ef': 'etf', 'bitcon': 'bitcoin', 'bitcoi': 'bitcoin',
          'cripto': 'crypto', 'obligazione': 'obbligazione', 'obbl': 'obbligazione',
          'imobile': 'immobile', 'imobiliare': 'immobiliare'
        }
      },
      
      // Termini relativi agli ENTRATE con possibili errori di battitura
      income: {
        base: ['ricevuto', 'guadagnato', 'incassato', 'entrata', 'stipendio', 'rimborso', 'pagamento'],
        variations: {
          'ricevto': 'ricevuto', 'ricevuo': 'ricevuto', 'ricevut': 'ricevuto',
          'guadagnto': 'guadagnato', 'guadagnat': 'guadagnato', 'guadagno': 'guadagnato',
          'incasato': 'incassato', 'incassao': 'incassato', 'incassatoo': 'incassato',
          'entata': 'entrata', 'entrta': 'entrata', 'entrataa': 'entrata',
          'stipendo': 'stipendio', 'stipendyo': 'stipendio', 'stipndio': 'stipendio',
          'rimborzo': 'rimborso', 'rimborsso': 'rimborso', 'rimbrso': 'rimborso',
          'pagameno': 'pagamento', 'pagament': 'pagamento', 'pagamneto': 'pagamento'
        },
        sources: {
          'lavoro': ['stipendio', 'salario', 'compenso', 'consulenza', 'freelance', 'parcella', 'fattura'],
          'extra': ['bonus', 'premio', 'incentivo', 'commissione', 'straordinario', 'tredicesima', 'quattordicesima'],
          'passivo': ['affitto', 'rendita', 'dividendo', 'royalty', 'interesse', 'cedola'],
          'occasionale': ['vendita', 'regalo', 'rimborso', 'cashback', 'lotteria', 'vincita', 'donazione']
        },
        sourcesVariations: {
          'stpendio': 'stipendio', 'salrio': 'salario', 'bonuss': 'bonus',
          'divdendo': 'dividendo', 'divident': 'dividendo', 'intresse': 'interesse'
        }
      },
      
      // Termini relativi agli AUMENTI DI REDDITO con possibili errori di battitura
      incomeIncrease: {
        base: ['aumento', 'promozione', 'avanzamento', 'incremento', 'adeguamento', 'nuovo stipendio', 'nuovo lavoro'],
        variations: {
          'aumeto': 'aumento', 'aumnt': 'aumento', 'aumennto': 'aumento',
          'promzione': 'promozione', 'promozine': 'promozione', 'promzione': 'promozione',
          'avanzameto': 'avanzamento', 'avanzment': 'avanzamento', 'avanzament': 'avanzamento',
          'incremeto': 'incremento', 'incr': 'incremento', 'increment': 'incremento',
          'adeguameto': 'adeguamento', 'adegument': 'adeguamento', 'adeg': 'adeguamento',
          'nuovostipendio': 'nuovo stipendio', 'nuovolavoro': 'nuovo lavoro'
        }
      }
    };
  }
  
  public getData(): KnowledgeBaseData {
    return this.data;
  }
  
  public getCategory(category: string): any {
    return this.data[category as keyof KnowledgeBaseData];
  }
}
