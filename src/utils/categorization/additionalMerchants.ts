
import { addCustomRule } from './index';

/**
 * Initialize additional merchant patterns for better coverage
 */
export function initializeAdditionalMerchants(): void {
  // Shopping
  addCustomRule("Shopping", "shopping-bag", [
    /costco/i,
    /best buy/i,
    /home depot/i,
    /lowe's/i,
    /ikea/i,
    /macy's/i,
    /nordstrom/i,
    /tj ?maxx/i,
    /marshalls/i,
    /ross/i,
    /kohl's/i,
    /dollar (tree|general|store)/i
  ]);
  
  // Food/Cibo
  addCustomRule("Cibo", "shopping-bag", [
    /kroger/i,
    /safeway/i,
    /publix/i,
    /whole foods/i,
    /trader joe's/i,
    /aldi/i,
    /save-a-lot/i,
    /wendy's/i,
    /burger king/i,
    /taco bell/i,
    /domino's/i,
    /papa john's/i,
    /kfc/i,
    /popeyes/i,
    /chick-fil-a/i,
    /dunkin'? donuts/i,
    /ristorante/i,
    /pizzeria/i,
    /trattoria/i,
    /osteria/i,
    /panetteria/i,
    /pasticceria/i
  ]);
  
  // Entertainment/Intrattenimento
  addCustomRule("Intrattenimento", "coffee", [
    /amc/i,
    /regal/i,
    /cinemark/i,
    /playstation/i,
    /xbox/i,
    /nintendo/i,
    /apple tv/i,
    /amazon prime/i,
    /paramount\+/i,
    /peacock/i,
    /eventbrite/i,
    /ticketmaster/i,
    /stubhub/i,
    /cinema/i,
    /teatro/i,
    /concerto/i,
    /museo/i
  ]);
  
  // Transport/Trasporto
  addCustomRule("Trasporto", "car", [
    /gas station/i,
    /shell/i,
    /chevron/i,
    /exxon/i,
    /mobil/i,
    /bp/i,
    /delta/i,
    /southwest/i,
    /united/i,
    /american airlines/i,
    /hertz/i,
    /enterprise/i,
    /avis/i,
    /amtrak/i,
    /greyhound/i,
    /parking/i,
    /toll/i,
    /benzina/i,
    /autostrada/i,
    /treno/i,
    /aereo/i,
    /volo/i,
    /trenitalia/i,
    /italo/i,
    /metro/i,
    /autobus/i
  ]);
  
  // Utilities/Utenze
  addCustomRule("Utenze", "smartphone", [
    /at&t/i,
    /verizon/i,
    /t-mobile/i,
    /sprint/i,
    /xfinity/i,
    /comcast/i,
    /spectrum/i,
    /cox/i,
    /pg&e/i,
    /edison/i,
    /water bill/i,
    /sewer/i,
    /trash/i,
    /waste management/i,
    /telefono/i,
    /telecom/i,
    /tim/i,
    /vodafone/i,
    /wind/i,
    /iliad/i,
    /fastweb/i,
    /enel/i,
    /luce/i,
    /gas/i,
    /acqua/i,
    /rifiuti/i
  ]);
  
  // Housing/Alloggio
  addCustomRule("Alloggio", "home", [
    /affitto/i,
    /mutuo/i,
    /condominio/i,
    /casa/i,
    /appartamento/i
  ]);
  
  console.log("Initialized additional merchant patterns");
}
