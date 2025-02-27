
import React from 'react';
import { 
  Banknote, 
  Building, 
  BarChart3, 
  LineChart, 
  Landmark, 
  Percent,
  Wallet,
  Briefcase,
  Home,
  PiggyBank,
  HeartPulse,
  CircleDollarSign
} from 'lucide-react';

/**
 * Classe per categorizzare investimenti basata su regole
 */
class RuleBasedInvestmentCategorizer {
  categoryRules: {
    category: string;
    patterns: RegExp[];
    tickerPatterns?: RegExp[];
    icon: React.ReactElement;
  }[];
  defaultCategory: string;
  defaultIcon: React.ReactElement;

  constructor() {
    // Definizione delle categorie e pattern di investimenti
    this.categoryRules = [
      {
        category: 'Azioni',
        patterns: [
          /\bstock\b/i, /\bazioni\b/i, /\btitoli\b/i, /\bequity\b/i, /\bshares\b/i,
          /inc\b/i, /\bspa\b/i, /\bs\.p\.a\b/i, /\bcorp\b/i, /\bplc\b/i, /\bltd\b/i,
          /\bholding\b/i, /\binc\b/i, /\bag\b/i, /\bse\b/i, /\bnv\b/i, 
          /tesla/i, /apple/i, /microsoft/i, /amazon/i, /google/i, /meta/i, /nvidia/i,
          /enel/i, /eni/i, /intesa/i, /unicredit/i, /ferrari/i, /stellantis/i
        ],
        tickerPatterns: [
          /^[A-Z]{1,5}$/, // Tickers USA
          /^[A-Z]{2,6}\.[A-Z]{2}$/ // Tickers europei
        ],
        icon: <BarChart3 size={18} />
      },
      {
        category: 'ETF',
        patterns: [
          /\betf\b/i, /exchange traded fund/i, /ishares/i, /vanguard/i, /spdr/i,
          /lyxor/i, /amundi/i, /xtrackers/i, /invesco/i, /wisdomtree/i,
          /\btracker\b/i, /\bindex fund\b/i, /\bindexfund\b/i, /\betn\b/i,
          /msci/i, /ftse/i, /s&p/i, /russell/i, /nasdaq/i, /dow jones/i
        ],
        tickerPatterns: [
          /^[A-Z]{3,4}$/
        ],
        icon: <LineChart size={18} />
      },
      {
        category: 'Obbligazioni',
        patterns: [
          /\bbond\b/i, /\bbonds\b/i, /\bobbligazioni\b/i, /\btitoli di stato\b/i,
          /\bbtp\b/i, /\bbund\b/i, /\btreasury\b/i, /\btreasuries\b/i,
          /\bcedola\b/i, /\bcoupon\b/i, /\bfixed income\b/i, /\breddito fisso\b/i,
          /\bcorporate bond\b/i, /\bhigh yield\b/i, /\binvestment grade\b/i,
          /\bjunk bond\b/i, /\bmunicipal\b/i, /\bsovereign\b/i
        ],
        icon: <Percent size={18} />
      },
      {
        category: 'Fondi Comuni',
        patterns: [
          /\bmutual fund\b/i, /\bfondo\b/i, /\bfondi\b/i, /\bfonds\b/i,
          /\bsicav\b/i, /\boicr\b/i, /\bucits\b/i, /\bcomparto\b/i,
          /\bfidelity\b/i, /\bjp morgan\b/i, /\bblackrock\b/i, /\bpimco\b/i,
          /\beurizon\b/i, /\bgenerali\b/i, /\banima\b/i, /\bmediolanum\b/i,
          /\bfineco\b/i, /\bschroders\b/i, /\baxa\b/i, /\ball[ie]anz\b/i
        ],
        icon: <Briefcase size={18} />
      },
      {
        category: 'Immobiliare',
        patterns: [
          /\brealestate\b/i, /\breit\b/i, /\bimmobiliare\b/i, /\bproperty\b/i,
          /\breal estate\b/i, /\bestate\b/i, /\bhousing\b/i, /\bcommercial property\b/i,
          /\bresidential\b/i, /\bmulti-family\b/i, /\bsiiq\b/i, /\bfondo immobiliare\b/i,
          /\brent\b/i, /\blease\b/i, /\baffitto\b/i, /\blivello\b/i, /\bcasa\b/i
        ],
        icon: <Building size={18} />
      },
      {
        category: 'Materie Prime',
        patterns: [
          /\bcommodit(y|ies)\b/i, /\bmaterie prime\b/i, /\bgold\b/i, /\boro\b/i,
          /\bsilver\b/i, /\bargento\b/i, /\bplatinum\b/i, /\boil\b/i, /\bpetrolio\b/i, 
          /\bnatural gas\b/i, /\bgas naturale\b/i, /\bcopper\b/i, /\brame\b/i,
          /\baluminum\b/i, /\balluminio\b/i, /\biron\b/i, /\bferro\b/i, 
          /\bsteel\b/i, /\bacciaio\b/i, /\bwheat\b/i, /\bgrano\b/i,
          /\bcorn\b/i, /\bmais\b/i, /\bcoffee\b/i, /\bcaffe\b/i, /\bsugar\b/i, /\bzucchero\b/i,
          /\bcotton\b/i, /\bcotone\b/i
        ],
        icon: <CircleDollarSign size={18} />
      },
      {
        category: 'Criptovalute',
        patterns: [
          /\bcrypto\b/i, /\bcriptovalute\b/i, /\bcryptocurrenc(y|ies)\b/i,
          /\bbitcoin\b/i, /\bethereum\b/i, /\bripple\b/i, /\blitecoin\b/i,
          /\bcardano\b/i, /\bpolkadot\b/i, /\bchain\b/i, /\bsatoshi\b/i,
          /\btoken\b/i, /\bwallet\b/i, /\bmining\b/i, /\bminer\b/i,
          /\bblockchain\b/i, /\bnft\b/i, /\bdefi\b/i, /\bdecentralized\b/i,
          /\bsmart contract\b/i, /\bcoin\b/i
        ],
        tickerPatterns: [
          /^[A-Z]{3,5}$/
        ],
        icon: <Wallet size={18} />
      },
      {
        category: 'Investimenti Alternativi',
        patterns: [
          /\balternative\b/i, /\balternativi\b/i, /\bhedge fund\b/i, /\bprivate equity\b/i,
          /\bventure capital\b/i, /\bstartup\b/i, /\bart\b/i, /\barte\b/i,
          /\bcollectable\b/i, /\bcollection\b/i, /\bcollezione\b/i, /\bantique\b/i,
          /\bantico\b/i, /\bwine\b/i, /\bvino\b/i, /\bluxury\b/i, /\blusso\b/i,
          /\bwatch\b/i, /\borologo\b/i, /\bjewel\b/i, /\bgioiello\b/i,
          /\bcar\b/i, /\bauto\b/i, /\bprivate debt\b/i, /\binfrastructure\b/i,
          /\binfrastrutture\b/i, /\btimber\b/i, /\blegno\b/i, /\binvoice\b/i,
          /\bfattura\b/i, /\bfatture\b/i, /\bcrowdfunding\b/i, /\bp2p\b/i
        ],
        icon: <Landmark size={18} />
      },
      {
        category: 'Pensione',
        patterns: [
          /\bpension\b/i, /\bpensione\b/i, /\bretirement\b/i, /\b401k\b/i,
          /\bira\b/i, /\broth\b/i, /\bprevidenza\b/i, /\bfondi? pensione\b/i,
          /\bpip\b/i, /\btfr\b/i, /\btrattamento fine rapporto\b/i,
          /\bintegrativa\b/i, /\banzianti(tà)?\b/i
        ],
        icon: <PiggyBank size={18} />
      },
      {
        category: 'Assicurazioni',
        patterns: [
          /\binsurance\b/i, /\bassicurazione\b/i, /\bpolizza\b/i, /\bpolicy\b/i,
          /\bvita\b/i, /\blife\b/i, /\bunit linked\b/i, /\bindex linked\b/i,
          /\bgestione separata\b/i, /\bpremio\b/i, /\bpremium\b/i, /\briscatto\b/i,
          /\bsurrender\b/i, /\bannuity\b/i, /\brendita\b/i
        ],
        icon: <HeartPulse size={18} />
      }
    ];
    
    // Categoria predefinita se nessuna regola corrisponde
    this.defaultCategory = 'Non Categorizzato';
    this.defaultIcon = <Landmark size={18} />;
  }

  // Trova categoria per un investimento
  categorize(investmentDetails: {name?: string, ticker?: string, description?: string}): {category: string, icon: React.ReactElement} {
    if (!investmentDetails || (!investmentDetails.name && !investmentDetails.ticker)) {
      return {
        category: this.defaultCategory,
        icon: this.defaultIcon
      };
    }
    
    const name = investmentDetails.name || '';
    const ticker = investmentDetails.ticker || '';
    const description = investmentDetails.description || '';
    
    // Prova a corrispondere ogni pattern
    for (const rule of this.categoryRules) {
      // Controlla pattern sul nome
      for (const pattern of rule.patterns || []) {
        if (pattern.test(name) || pattern.test(description)) {
          return {
            category: rule.category,
            icon: rule.icon
          };
        }
      }
      
      // Controlla pattern sul ticker
      if (ticker && rule.tickerPatterns) {
        for (const tickerPattern of rule.tickerPatterns) {
          if (tickerPattern.test(ticker)) {
            return {
              category: rule.category,
              icon: rule.icon
            };
          }
        }
      }
    }
    
    // Nessuna corrispondenza trovata
    return {
      category: this.defaultCategory,
      icon: this.defaultIcon
    };
  }
  
  // Aggiungi regola personalizzata
  addCustomRule(category: string, patterns: RegExp[], icon: React.ReactElement, tickerPatterns: RegExp[] = []): void {
    // Controlla se la categoria esiste già
    const existingRule = this.categoryRules.find(rule => rule.category === category);
    
    if (existingRule) {
      // Aggiungi pattern alla categoria esistente
      existingRule.patterns = [...(existingRule.patterns || []), ...patterns];
      existingRule.tickerPatterns = [...(existingRule.tickerPatterns || []), ...tickerPatterns];
    } else {
      // Crea nuova categoria
      this.categoryRules.push({
        category,
        patterns,
        tickerPatterns,
        icon
      });
    }
  }
}

// Crea un'istanza singola del categorizzatore
const categorizer = new RuleBasedInvestmentCategorizer();

/**
 * Auto-categorizza un investimento in base al nome, ticker o descrizione
 */
export function categorizeInvestment(investmentDetails: {name?: string, ticker?: string, description?: string}): {category: string, icon: React.ReactElement} {
  return categorizer.categorize(investmentDetails);
}

/**
 * Aggiunge una regola personalizzata di categorizzazione
 */
export function addCustomRule(category: string, patterns: RegExp[], icon: React.ReactElement, tickerPatterns: RegExp[] = []): void {
  categorizer.addCustomRule(category, patterns, icon, tickerPatterns);
}

/**
 * Restituisce l'icona appropriata per una categoria
 */
export function getIconForCategory(category: string): React.ReactElement {
  const rule = categorizer.categoryRules.find(r => r.category === category);
  return rule ? rule.icon : categorizer.defaultIcon;
}

/**
 * Restituisce tutte le categorie disponibili
 */
export function getAllCategories(): string[] {
  return categorizer.categoryRules.map(rule => rule.category);
}

// Inizializza con alcune regole aggiuntive specifiche
(function initializeAdditionalRules() {
  // Aggiungi eventuali regole specifiche per l'app qui
  // Esempio: categorizer.addCustomRule('Categoria Custom', [/pattern/i], <IconComponent />);
})();
