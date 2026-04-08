import type { Balance, RedemptionEntry } from '@/types'

// Maps common user-entered aliases to the canonical program name used in seed.json
const ALIASES: Record<string, string> = {
  'chase ultimate rewards': 'Chase Ultimate Rewards',
  'chase ur':               'Chase Ultimate Rewards',
  'chase':                  'Chase Ultimate Rewards',
  'amex membership rewards':'Amex Membership Rewards',
  'amex mr':                'Amex Membership Rewards',
  'amex':                   'Amex Membership Rewards',
  'membership rewards':     'Amex Membership Rewards',
  'capital one miles':      'Capital One Miles',
  'capital one':            'Capital One Miles',
  'citi thankyou points':   'Citi ThankYou Points',
  'citi thankyou':          'Citi ThankYou Points',
  'citi ty':                'Citi ThankYou Points',
  'citi':                   'Citi ThankYou Points',
  'aeroplan':               'Aeroplan',
  'air canada aeroplan':    'Aeroplan',
  'alaska mileage plan':    'Alaska Mileage Plan',
  'alaska airlines':        'Alaska Mileage Plan',
  'american aadvantage':    'American AAdvantage',
  'aa aadvantage':          'American AAdvantage',
  'aadvantage':             'American AAdvantage',
  'avianca lifemiles':      'Avianca LifeMiles',
  'lifemiles':              'Avianca LifeMiles',
  'british airways avios':  'British Airways Avios',
  'avios':                  'British Airways Avios',
  'delta skymiles':         'Delta SkyMiles',
  'skymiles':               'Delta SkyMiles',
  'delta':                  'Delta SkyMiles',
  'flying blue':            'Flying Blue',
  'air france':             'Flying Blue',
  'klm':                    'Flying Blue',
  'hilton honors':          'Hilton Honors',
  'hilton hhonors':         'Hilton Honors',
  'hilton':                 'Hilton Honors',
  'ihg one rewards':        'IHG One Rewards',
  'ihg':                    'IHG One Rewards',
  'marriott bonvoy':        'Marriott Bonvoy',
  'bonvoy':                 'Marriott Bonvoy',
  'marriott':               'Marriott Bonvoy',
  'qantas points':          'Qantas Points',
  'qantas':                 'Qantas Points',
  'singapore krisflyer':    'Singapore KrisFlyer',
  'krisflyer':              'Singapore KrisFlyer',
  'turkish miles&smiles':   'Turkish Miles&Smiles',
  'turkish milessmiles':    'Turkish Miles&Smiles',
  'miles&smiles':           'Turkish Miles&Smiles',
  'united mileageplus':     'United MileagePlus',
  'mileageplus':            'United MileagePlus',
  'united':                 'United MileagePlus',
  'virgin atlantic flying club': 'Virgin Atlantic Flying Club',
  'virgin atlantic':        'Virgin Atlantic Flying Club',
  'flying club':            'Virgin Atlantic Flying Club',
  'world of hyatt':         'World of Hyatt',
  'hyatt':                  'World of Hyatt',
}

export function normalizeProgram(name: string): string {
  return ALIASES[name.toLowerCase().trim()] ?? name
}

// Returns only entries relevant to the user's balances.
// An entry is relevant if the user directly holds the program, or holds a
// flexible currency that transfers into it.
export function filterByPrograms(
  balances: Balance[],
  entries: RedemptionEntry[]
): RedemptionEntry[] {
  const userPrograms = new Set(balances.map((b) => normalizeProgram(b.program)))

  return entries.filter(
    (entry) =>
      userPrograms.has(normalizeProgram(entry.program)) ||
      entry.transferable_from.some((tf) => userPrograms.has(normalizeProgram(tf)))
  )
}
