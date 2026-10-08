export type Company = { name: string; domain: string };

// name -> website domain (used for the logo). Empty domain = no logo, shows an initial instead.
const LIST: [string, string][] = [
  ["ABCO", ""],
  ["Accolite", "accolite.com"],
  ["Adobe", "adobe.com"],
  ["Alibaba", "alibaba.com"],
  ["Amazon", "amazon.com"],
  ["American Express", "americanexpress.com"],
  ["Amdocs", "amdocs.com"],
  ["Apple", "apple.com"],
  ["Atlassian", "atlassian.com"],
  ["BankBazaar", "bankbazaar.com"],
  ["Barclays", "barclays.com"],
  ["Belzabar", "belzabar.com"],
  ["Brocade", "broadcom.com"],
  ["Cadence India", "cadence.com"],
  ["Cisco", "cisco.com"],
  ["Cisco Networking Academy", "netacad.com"],
  ["Citicorp", "citi.com"],
  ["Citrix", "citrix.com"],
  ["Codenation", "codenation.dev"],
  ["CouponDunia", "coupondunia.in"],
  ["D-E-Shaw", "deshaw.com"],
  ["Delhivery", "delhivery.com"],
  ["Directi", "directi.com"],
  ["Drishti-Soft", "drishti-soft.com"],
  ["Dunzo", "dunzo.com"],
  ["eBay", "ebay.com"],
  ["Epic Systems", "epic.com"],
  ["EPAM Systems", "epam.com"],
  ["Expedia Group", "expedia.com"],
  ["Facebook", "facebook.com"],
  ["FactSet", "factset.com"],
  ["Fidelity International", "fidelity.com"],
  ["Flipkart", "flipkart.com"],
  ["FreeCharge", "freecharge.in"],
  ["GeekyAnts", "geekyants.com"],
  ["Goldman Sachs", "goldmansachs.com"],
  ["Google", "google.com"],
  ["Grofers", "blinkit.com"],
  ["GreyOrange", "greyorange.com"],
  ["Hike", "hike.in"],
  ["Housing.com", "housing.com"],
  ["HSBC", "hsbc.com"],
  ["IBM", "ibm.com"],
  ["InMobi", "inmobi.com"],
  ["Infosys", "infosys.com"],
  ["Intuit", "intuit.com"],
  ["Josh Technology Group", "joshtechgroup.com"],
  ["Juniper Networks", "juniper.net"],
  ["Kritikal Solutions", "kritikalsolutions.com"],
  ["Kuliza", "kuliza.com"],
  ["Lenskart", "lenskart.com"],
  ["Linkedin", "linkedin.com"],
  ["Lybrate", "lybrate.com"],
  ["Maccafe", ""],
  ["Mahindra Comviva", "comviva.com"],
  ["MakeMyTrip", "makemytrip.com"],
  ["MAQ Software", "maqsoftware.com"],
  ["Media.net", "media.net"],
  ["Meta", "meta.com"],
  ["Microsoft", "microsoft.com"],
  ["Mobicip", "mobicip.com"],
  ["Monotype Solutions", "monotype.com"],
  ["Moonfrog Labs", "moonfroglabs.com"],
  ["Morgan Stanley", "morganstanley.com"],
  ["Myntra", "myntra.com"],
  ["Nagarro", "nagarro.com"],
  ["Nearbuy", "nearbuy.com"],
  ["OATS Systems", ""],
  ["Ola Cabs", "olacabs.com"],
  ["Opera", "opera.com"],
  ["Oracle", "oracle.com"],
  ["Oxigen Wallet", ""],
  ["OYO Rooms", "oyorooms.com"],
  ["Payload", ""],
  ["PayPal", "paypal.com"],
  ["Paytm", "paytm.com"],
  ["Payu", "payu.in"],
  ["Philips", "philips.com"],
  ["Pubmatic", "pubmatic.com"],
  ["Qualcomm", "qualcomm.com"],
  ["Quikr", "quikr.com"],
  ["Razorpay", "razorpay.com"],
  ["Salesforce", "salesforce.com"],
  ["Samsung", "samsung.com"],
  ["SAP Labs", "sap.com"],
  ["Sharechat", "sharechat.com"],
  ["Siemens", "siemens.com"],
  ["Snapdeal", "snapdeal.com"],
  ["Societe Generale", "societegenerale.com"],
  ["Sprinklr", "sprinklr.com"],
  ["Swiggy", "swiggy.com"],
  ["Synopsys", "synopsys.com"],
  ["TCS", "tcs.com"],
  ["Times Internet", "timesinternet.in"],
  ["Traveloka", "traveloka.com"],
  ["Triology", ""],
  ["Twitter", "twitter.com"],
  ["Uber", "uber.com"],
  ["Veritas", "veritas.com"],
  ["Visa", "visa.com"],
  ["VMWare", "vmware.com"],
  ["Walmart", "walmart.com"],
  ["Webarch Club", ""],
  ["Wooker", ""],
  ["Yahoo", "yahoo.com"],
  ["Yatra.com", "yatra.com"],
  ["Zoho", "zoho.com"],
  ["24*7 Innovation Labs", "247.ai"],
  ["Streamoid Technologies", "streamoid.com"],
  ["Citicorp", "citi.com"],
];

// Extra spellings that point to a canonical name above.
const ALIASES: Record<string, string> = {
  ola: "Ola Cabs",
};

const MAP = new Map<string, Company>();
for (const [name, domain] of LIST) MAP.set(name.toLowerCase(), { name, domain });
for (const [alias, name] of Object.entries(ALIASES)) {
  const c = MAP.get(name.toLowerCase());
  if (c) MAP.set(alias, c);
}

const MAX_WORDS = 3;

/** Turns the PDF's company text ("Amazon + Goldman Sachs + Ola Cabs") into a list of companies. */
export function parseCompanies(raw: string): Company[] {
  const words = raw.replace(/\+/g, " ").split(/\s+/).filter(Boolean);
  const out: Company[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (i < words.length) {
    let hit = false;
    for (let n = Math.min(MAX_WORDS, words.length - i); n >= 1; n--) {
      const key = words.slice(i, i + n).join(" ").toLowerCase();
      const c = MAP.get(key);
      if (c) {
        if (!seen.has(c.name)) {
          seen.add(c.name);
          out.push(c);
        }
        i += n;
        hit = true;
        break;
      }
    }
    if (!hit) i++;
  }
  return out;
}

export function logoUrl(domain: string, size = 64): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}
