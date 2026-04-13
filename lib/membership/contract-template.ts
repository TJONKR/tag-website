// Contract template v2.0 — TAG sub-lease agreement.
//
// TAG huurt zelf van AI AM B.V. (hoofdverhuurder). Members zijn onderhuurder.
// Afgeleid van de Notso B.V. huurovereenkomst, aangepast voor onderverhuur-positie.
//
// DRAFT — juridisch te reviewen voor live release.

export const CONTRACT_VERSION = '2.0'

export const CONTRACT_PRICE_EUR = 150 // per maand, excl. BTW
export const CONTRACT_VAT_PERCENT = 21
export const CONTRACT_ADDRESS = 'Jacob Bontiusplaats 9-23, Amsterdam, Nederland'
export const CONTRACT_HOOFDVERHUURDER = 'AI AM B.V. (KVK 97054305)'
export const CONTRACT_ONDERVERHUURDER = 'TAG'

export type ContractLanguage = 'nl' | 'en'

export interface ContractFieldData {
  companyName: string
  kvk: string
  city: string
  representativeName: string
  language: ContractLanguage
}

export interface ContractSection {
  title: string
  content: string
}

export interface ContractTemplate {
  title: string
  sections: ContractSection[]
  signatureLabel: string
  dateLabel: string
  versionLabel: string
}

const fillTemplate = (
  template: string,
  fields: ContractFieldData,
  signedAt: Date
): string => {
  return template
    .replaceAll('{{companyName}}', fields.companyName)
    .replaceAll('{{kvk}}', fields.kvk)
    .replaceAll('{{city}}', fields.city)
    .replaceAll('{{representativeName}}', fields.representativeName)
    .replaceAll(
      '{{startDate}}',
      signedAt.toLocaleDateString(fields.language === 'nl' ? 'nl-NL' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )
}

const nlTemplate: ContractTemplate = {
  title: 'Onderhuurovereenkomst Flexibele Werkplek',
  versionLabel: 'Versie',
  signatureLabel: 'Ondertekend door',
  dateLabel: 'Datum',
  sections: [
    {
      title: '1. Partijen',
      content:
        `Onderverhuurder: ${CONTRACT_ONDERVERHUURDER}, hierna "TAG" genoemd, optredend als ` +
        `onderverhuurder uit hoofde van haar huurovereenkomst met ${CONTRACT_HOOFDVERHUURDER} ` +
        `(hierna "de Hoofdverhuurder").\n\n` +
        `Onderhuurder: {{companyName}}, KVK-nummer {{kvk}}, gevestigd te {{city}} ` +
        `(hierna "de Onderhuurder"). Vertegenwoordigd door {{representativeName}}.`,
    },
    {
      title: '2. Gehuurde Ruimte',
      content:
        `Adres: ${CONTRACT_ADDRESS}.\n` +
        `Oppervlakte: 1 (één) Flexible Desk.\n` +
        `Bestemming: De gehuurde ruimte zal uitsluitend worden gebruikt als kantoorruimte ` +
        `voor AI-gerelateerde activiteiten.`,
    },
    {
      title: '3. Duur, Verlengen en Beëindigen',
      content:
        '3.1 Deze onderhuurovereenkomst wordt aangegaan voor de duur van een maand met als ' +
        'begindatum {{startDate}}. De overeenkomst zal automatisch en voortdurend worden verlengd ' +
        'met een maand tot wederopzegging.\n\n' +
        '3.2 Opzegging dient schriftelijk te worden ingediend voor de 15e van de lopende maand. ' +
        'Bij opzegging op of na de 15e wordt de overeenkomst beëindigd aan het einde van de ' +
        'volgende maand.\n\n' +
        '3.3 De Onderhuurder dient de gehuurde ruimte bij beëindiging schoon en in originele ' +
        'staat op te leveren.\n\n' +
        '3.4 Beëindiging bij actie hoofdverhuurder: indien de huurovereenkomst tussen TAG en de ' +
        'Hoofdverhuurder eindigt of wijzigt, of indien de Hoofdverhuurder beëindiging verlangt, ' +
        'kan TAG deze onderhuurovereenkomst tussentijds beëindigen met inachtneming van de ' +
        'geldende wettelijke en contractuele opzegtermijnen. De Onderhuurder heeft in dat geval ' +
        'geen recht op schadevergoeding, behoudens terugbetaling van vooruitbetaalde huur die ' +
        'ziet op de periode ná de beëindigingsdatum.',
    },
    {
      title: '4. Huurprijs en Betalingsvoorwaarden',
      content:
        `4.1 De huurprijs bedraagt €${CONTRACT_PRICE_EUR},- per maand en is exclusief ${CONTRACT_VAT_PERCENT}% BTW. ` +
        'Dit is voor één Flexible Desk en is maandelijks vooruit te betalen, uiterlijk op de ' +
        'eerste dag van elke maand.\n\n' +
        '4.2 Huurverhoging: TAG heeft het recht om de huurprijs jaarlijks te verhogen op basis ' +
        'van de consumentenprijsindex (CPI) of andere relevante marktfactoren. De huurprijs kan ' +
        'worden verhoogd op de eerste dag van de 13e maand en daarna jaarlijks per 1 juli, met ' +
        'een verhoging die maximaal 5% per jaar mag bedragen. De Onderhuurder wordt ten minste ' +
        'twee maanden voor de verhoging schriftelijk op de hoogte gesteld.\n\n' +
        '4.3 Waarborgsom: Er is geen waarborgsom voor deze overeenkomst.\n\n' +
        '4.4 Betaling geschiedt via Stripe (creditcard of automatische incasso). Indien de ' +
        'Onderhuurder de huur niet tijdig betaalt, is de Onderhuurder van rechtswege in verzuim ' +
        'en is een rente verschuldigd van 1,5% per maand over het openstaande bedrag, te rekenen ' +
        'vanaf de eerste dag na de vervaldatum.',
    },
    {
      title: '5. Diensten en Voorzieningen',
      content:
        '5.1 De volgende voorzieningen worden, via TAG en de Hoofdverhuurder, aan de ' +
        'Onderhuurder ter beschikking gesteld:\n' +
        '• Beheer van gemeenschappelijke ruimtes\n' +
        '• Beveiliging en toezicht\n' +
        '• Schoonmaak van gemeenschappelijke ruimtes\n' +
        '• Internetverbinding\n' +
        '• Onderhoud van het gebouw en faciliteiten\n' +
        '• Energieverbruik en afvalverwerking\n' +
        '• Levering van koffie, thee, water en fruit in de gemeenschappelijke ruimtes\n' +
        '• Toegang tot TAG events en community resources\n\n' +
        '5.2 Na overleg met de Onderhuurder is TAG gerechtigd om de voorzieningen te wijzigen ' +
        'of stop te zetten, met inachtneming van de redelijke belangen van de Onderhuurder.',
    },
    {
      title: '6. Gebruik van de Gehuurde Ruimte',
      content:
        'De Onderhuurder mag de kantoorruimte uitsluitend gebruiken voor kantoor- en ' +
        'werkdoeleinden gerelateerd aan AI-projecten. Het is de Onderhuurder niet toegestaan de ' +
        'gehuurde ruimte voor andere doeleinden te gebruiken zonder voorafgaande schriftelijke ' +
        'toestemming van TAG.',
    },
    {
      title: '7. Onderhoud en Wijzigingen',
      content:
        'De Onderhuurder is verantwoordelijk voor het onderhoud en de netheid van de eigen ' +
        'werkplek. Wijzigingen in de gehuurde ruimte mogen alleen plaatsvinden met schriftelijke ' +
        'toestemming van TAG.',
    },
    {
      title: '8. Verzekering & Aansprakelijkheid',
      content:
        'De Onderhuurder dient zelf zorg te dragen voor een adequate verzekering van eigen ' +
        'eigendommen. TAG is niet aansprakelijk voor verlies, diefstal of beschadiging van ' +
        'persoonlijke eigendommen.',
    },
    {
      title: '9. Algemene Bepalingen Huurovereenkomst Kantoorruimte',
      content:
        'Deze overeenkomst is onderworpen aan de "ALGEMENE BEPALINGEN HUUROVEREENKOMST ' +
        'KANTOORRUIMTE en andere bedrijfsruimte in de zin van artikel 7:230a BW", welke zijn ' +
        'gedeponeerd bij de Rechtbank Den Haag op 17 februari 2012 onder nummer 15/21 en ' +
        'gepubliceerd zijn op de website van de Raad voor Onroerende Zaken (www.roz.nl). Deze ' +
        'Algemene Bepalingen maken integraal deel uit van deze onderhuurovereenkomst. De ' +
        'Onderhuurder verklaart hierbij kennis te hebben genomen van de inhoud van deze ' +
        'Algemene Bepalingen.',
    },
    {
      title: '10. Ondertekening',
      content:
        'Door ondertekening bevestigt de Onderhuurder akkoord te gaan met de voorwaarden van ' +
        'deze onderhuurovereenkomst.',
    },
  ],
}

const enTemplate: ContractTemplate = {
  title: 'Sub-lease Agreement Flexible Workspace',
  versionLabel: 'Version',
  signatureLabel: 'Signed by',
  dateLabel: 'Date',
  sections: [
    {
      title: '1. Parties',
      content:
        `Sub-lessor: ${CONTRACT_ONDERVERHUURDER} (hereinafter "TAG"), acting as sub-lessor ` +
        `under its lease agreement with ${CONTRACT_HOOFDVERHUURDER} ` +
        `(hereinafter "the Head Lessor").\n\n` +
        `Sub-lessee: {{companyName}}, registered with the Dutch Chamber of Commerce under ` +
        `KVK number {{kvk}}, located in {{city}} (hereinafter "the Sub-lessee"). ` +
        `Represented by {{representativeName}}.`,
    },
    {
      title: '2. Leased Space',
      content:
        `Address: ${CONTRACT_ADDRESS}.\n` +
        `Surface: 1 (one) Flexible Desk.\n` +
        `Use: The leased space is to be used solely as office space for AI-related activities.`,
    },
    {
      title: '3. Term, Renewal and Termination',
      content:
        '3.1 This sub-lease agreement is entered into for a period of one month, starting on ' +
        '{{startDate}}. The agreement renews automatically and continuously by one month at a ' +
        'time, until terminated.\n\n' +
        '3.2 Termination must be submitted in writing before the 15th of the running month. If ' +
        'submitted on or after the 15th, the agreement ends at the end of the following month.\n\n' +
        '3.3 The Sub-lessee shall return the leased space clean and in its original condition ' +
        'upon termination.\n\n' +
        '3.4 Termination upon Head Lessor action: if the lease agreement between TAG and the ' +
        'Head Lessor ends or is modified, or if the Head Lessor demands termination, TAG may ' +
        'terminate this sub-lease agreement early, observing the applicable statutory and ' +
        'contractual notice periods. The Sub-lessee shall in such case have no right to ' +
        'compensation, save for refund of pre-paid rent covering the period after the ' +
        'termination date.',
    },
    {
      title: '4. Rent and Payment Terms',
      content:
        `4.1 The rent is €${CONTRACT_PRICE_EUR},- per month, excluding ${CONTRACT_VAT_PERCENT}% Dutch VAT. ` +
        'This covers one Flexible Desk and is payable monthly in advance, no later than the ' +
        'first day of each month.\n\n' +
        '4.2 Rent increase: TAG is entitled to increase the rent annually based on the consumer ' +
        'price index (CPI) or other relevant market factors. Rent may be increased on the first ' +
        'day of the 13th month and annually thereafter on July 1st, by no more than 5% per year. ' +
        'The Sub-lessee shall be notified in writing at least two months before any increase.\n\n' +
        '4.3 Deposit: No deposit is required for this agreement.\n\n' +
        '4.4 Payment is processed via Stripe (credit card or direct debit). If the Sub-lessee ' +
        'fails to pay on time, the Sub-lessee shall be in default by operation of law and shall ' +
        'owe interest of 1.5% per month on the outstanding amount, accruing from the first day ' +
        'after the due date.',
    },
    {
      title: '5. Services and Facilities',
      content:
        '5.1 The following facilities are provided to the Sub-lessee, via TAG and the Head ' +
        'Lessor:\n' +
        '• Management of common areas\n' +
        '• Security and supervision\n' +
        '• Cleaning of common areas\n' +
        '• Internet connection\n' +
        '• Maintenance of the building and facilities\n' +
        '• Energy and waste processing\n' +
        '• Coffee, tea, water and fruit in the common areas\n' +
        '• Access to TAG events and community resources\n\n' +
        '5.2 After consultation with the Sub-lessee, TAG may modify or discontinue facilities, ' +
        'taking the reasonable interests of the Sub-lessee into account.',
    },
    {
      title: '6. Use of the Leased Space',
      content:
        'The Sub-lessee may only use the office space for office and work purposes related to ' +
        'AI projects. The Sub-lessee may not use the leased space for any other purpose without ' +
        'prior written consent from TAG.',
    },
    {
      title: '7. Maintenance and Modifications',
      content:
        'The Sub-lessee is responsible for the maintenance and tidiness of their own workspace. ' +
        'Modifications to the leased space may only take place with prior written consent from TAG.',
    },
    {
      title: '8. Insurance & Liability',
      content:
        'The Sub-lessee shall maintain adequate insurance for their own property. TAG is not ' +
        'liable for loss, theft or damage to personal belongings.',
    },
    {
      title: '9. General Provisions Office Lease Agreement',
      content:
        'This agreement is subject to the "GENERAL PROVISIONS OFFICE LEASE AGREEMENT and other ' +
        'business space within the meaning of article 7:230a Dutch Civil Code", deposited with ' +
        'the District Court of The Hague on 17 February 2012 under number 15/21 and published ' +
        'on the website of the Council for Real Estate (www.roz.nl). These General Provisions ' +
        'form an integral part of this sub-lease agreement. The Sub-lessee hereby declares to ' +
        'have taken note of the contents of these General Provisions.',
    },
    {
      title: '10. Signature',
      content:
        'By signing, the Sub-lessee confirms agreement with the terms of this sub-lease ' +
        'agreement.',
    },
  ],
}

export const contractTemplates: Record<ContractLanguage, ContractTemplate> = {
  nl: nlTemplate,
  en: enTemplate,
}

export const renderContractSections = (
  fields: ContractFieldData,
  signedAt: Date
): ContractTemplate => {
  const template = contractTemplates[fields.language]
  return {
    ...template,
    sections: template.sections.map((section) => ({
      title: section.title,
      content: fillTemplate(section.content, fields, signedAt),
    })),
  }
}
