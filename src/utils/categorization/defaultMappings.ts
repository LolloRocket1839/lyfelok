
/**
 * A list of mappings between common merchant keywords and expense categories.
 * Each mapping contains a regex pattern for matching and the corresponding category and icon type.
 */
export const expenseMappings = [
  // Transportation mappings
  { regex: /uber|lyft|taxi|cab|metro|subway|train|bus|transit|carburante|benzina|autostrada|pedaggio|telepass|biglietto|treno|aereo|volo|parcheggio|car sharing|autonoleggio|noleggio auto|italo|trenitalia|ryanair|alitalia|flixbus|tram|trasporto pubblico/i, category: "Trasporto", iconType: "car" },
  
  // Food and groceries mappings
  { regex: /grocery|food|restaurant|cafe|starbucks|coffee|mcdonald|burger|pizza|taco|chipotle|panera|ristorante|trattoria|osteria|bar|supermercato|alimentari|cibo|pranzo|cena|colazione|pasticceria|gelateria|bakery|poke|sushi|kebab|esselunga|coop|carrefour|lidl|eurospin|conad|pam|auchan|penny|simply|spesa|delivery|deliveroo|glovo|justeat/i, category: "Cibo", iconType: "shopping-bag" },
  
  // Shopping mappings
  { regex: /amazon|walmart|target|shopping|store|shop|mall|clothing|electronics|apple|zara|h&m|ikea|mediaworld|euronics|unieuro|decathlon|abbigliamento|scarpe|shoes|boutique|vestiti|accessori|smartphone|computer|pc|tablet|tv|televisore|monitor|acquisto online|ebay|zalando|leroy merlin|bricolage|fai da te|brico|toys/i, category: "Shopping", iconType: "shopping-bag" },
  
  // Entertainment mappings
  { regex: /movie|netflix|spotify|hulu|disney|theater|concert|entertainment|game|steam|cinema|teatro|concerto|museo|mostra|biglietti|eventi|event|music|musica|disco|discoteca|night club|pub|playstation|xbox|nintendo|videogioco|cinema|uci|the space|spettacolo|live|festival|sport|calcio|partita|stadio|parco|divertimento|gardaland|mirabilandia|acquario|zoo|bowling|biliardo|escape room/i, category: "Intrattenimento", iconType: "coffee" },
  
  // Housing mappings
  { regex: /rent|mortgage|apartment|housing|home|condo|lease|property|affitto|mutuo|casa|condominio|spese condominiali|canone|locazione|immobiliare|agenzia immobiliare|manutenzione casa|riparazione|idraulico|elettricista|falegname|pulizie|domestica|colf|badante|arredamento|mobili|interior|design|architetto|trasloco|sgombero/i, category: "Alloggio", iconType: "home" },
  
  // Utilities mappings
  { regex: /phone|internet|cable|utility|electric|water|gas|bill|subscription|bolletta|utenze|luce|acqua|elettricità|metano|rifiuti|tari|tassa|tariffa|canone rai|telecom|tim|vodafone|fastweb|enel|eni|a2a|iren|sorgenia|fibra|adsl|wifi|telefono|cellulare|fisso|mobile|abbonamento telefonico|servizi|mensile|trimestrale|bimestrale/i, category: "Utenze", iconType: "smartphone" },
  
  // Health mappings
  { regex: /health|doctor|hospital|medical|pharmacy|medicine|dentist|healthcare|dental|salute|medico|dottore|ospedale|farmacia|farmaco|medicinale|visita|analisi|esame|terapia|cura|specialista|clinica|ambulatorio|pronto soccorso|emergenza|assicurazione sanitaria|operazione|intervento|chirurgia|riabilitazione|fisioterapia|ottico|occhiali|lenti|psicologia|terapista|benessere|massaggio|termale|terme|spa/i, category: "Salute", iconType: "smartphone" },
  
  // Education mappings
  { regex: /education|school|college|university|course|class|tuition|book|learning|study|textbook|istruzione|scuola|università|corso|lezione|master|laurea|dottorato|phd|tasse universitarie|tasse scolastiche|libri|manuale|esame|diploma|certificazione|formazione|professionale|lingue|tutoring|ripetizioni|seminario|workshop|conferenza|biblioteca|materiale didattico|cancelleria/i, category: "Istruzione", iconType: "coffee" },
  
  // Travel mappings
  { regex: /travel|hotel|airbnb|booking|flight|vacation|holiday|trip|tourism|resort|cruise|viaggio|albergo|pensione|bed and breakfast|volo|vacanza|ferie|turismo|tour|escursione|visita guidata|gita|soggiorno|prenotazione|agenzia viaggi|expedia|trivago|lastminute|traghetto|nave|crociera|camping|campeggio|bungalow|villaggio|turistico|spiaggia|montagna|mare|passaporto|visto|bagaglio/i, category: "Viaggi", iconType: "car" },
  
  // Personal care mappings
  { regex: /beauty|salon|spa|haircut|barber|cosmetic|makeup|skincare|nail|manicure|pedicure|bellezza|salone|parrucchiere|barbiere|estetista|cosmetico|trucco|cura della pelle|unghie|massaggio|trattamento|profumo|profumeria|sephora|douglas|prodotti|personale|igiene|cura|corpo|viso|capelli/i, category: "Cura Personale", iconType: "shopping-bag" },
  
  // Subscriptions and services
  { regex: /subscription|membership|service|monthly|annual|fee|abbonamento|iscrizione|servizio|mensile|annuale|quota|software|saas|cloud|dropbox|google|microsoft|office|adobe|photoshop|antivirus|vpn|storage|hosting|dominio|website|sito web|manutenzione|assistenza|consulenza|periodico|rivista|giornale|newsletter|streaming/i, category: "Abbonamenti", iconType: "smartphone" }
];
