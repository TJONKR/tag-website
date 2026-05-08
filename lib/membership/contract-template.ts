// Contract template v3.0 — TAG service agreement.
//
// AI AM B.V. (handelend onder de naam TAG) levert een dienstenpakket waarvan
// een flexibele werkplek onderdeel is. Bewust geen huurovereenkomst (geen
// 7:230a BW-bescherming) — toegang tot een werkplek is ondergeschikt aan het
// bredere dienstenpakket.

export const CONTRACT_VERSION = '3.0'

export const CONTRACT_PRICE_EUR = 150 // per maand, excl. BTW
export const CONTRACT_VAT_PERCENT = 21
export const CONTRACT_ADDRESS = 'Jacob Bontiusplaats 9-23, Amsterdam, Nederland'

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
  title: 'Servicecontract Flexibele Werkplek',
  versionLabel: 'Versie',
  signatureLabel: 'Ondertekend door',
  dateLabel: 'Datum',
  sections: [
    {
      title: '1. Partijen',
      content:
        'Dienstverlener: AI AM B.V., KVK-nummer 97054305, handelend onder de naam TAG ' +
        '(hierna "TAG" of "Dienstverlener" genoemd).\n\n' +
        'Lid: {{companyName}}, KVK-nummer {{kvk}}, gevestigd te {{city}} ' +
        '(hierna "het Lid"). Vertegenwoordigd door {{representativeName}}.',
    },
    {
      title: '2. Aard van de overeenkomst',
      content:
        '2.1 Deze overeenkomst betreft een dienstverleningsovereenkomst. TAG stelt het Lid in ' +
        'staat om gebruik te maken van een pakket aan diensten en faciliteiten zoals omschreven ' +
        'in artikel 5, waaronder toegang tot een flexibele werkplek.\n\n' +
        '2.2 Geen huurovereenkomst. Partijen verklaren uitdrukkelijk dat deze overeenkomst geen ' +
        'huurovereenkomst is in de zin van artikel 7:230a BW of enige andere bepaling van het ' +
        'huurrecht. Het Lid krijgt geen exclusief of uitsluitend gebruiksrecht op een specifieke ' +
        'ruimte of werkplek. De toegang tot een flexibele werkplek is ondergeschikt aan en ' +
        'onderdeel van het bredere dienstenpakket dat TAG levert.\n\n' +
        '2.3 Het Lid bevestigt dat het uitdrukkelijk geen huurbescherming wenst en dat de ' +
        'bepalingen van het huurrecht niet van toepassing zijn op deze overeenkomst.',
    },
    {
      title: '3. Diensten en toegang',
      content:
        `3.1 Locatie: ${CONTRACT_ADDRESS}.\n\n` +
        '3.2 Werkplek: het Lid heeft toegang tot één (1) flexibele werkplek. Het Lid heeft geen ' +
        'recht op een specifieke of vaste werkplek; de werkplekken worden op beschikbaarheid ' +
        'toegewezen en gedeeld met andere leden.\n\n' +
        '3.3 Doel: het gebruik is uitsluitend bestemd voor zakelijke werkzaamheden gerelateerd ' +
        'aan AI-projecten van het Lid.',
    },
    {
      title: '4. Looptijd, verlengen en beëindigen',
      content:
        '4.1 Deze overeenkomst gaat in op {{startDate}} en wordt aangegaan voor de duur van één ' +
        'maand. De overeenkomst wordt steeds stilzwijgend verlengd met een maand, tot ' +
        'wederopzegging.\n\n' +
        '4.2 Opzegging dient schriftelijk (per e-mail volstaat) te worden ingediend vóór de 15e ' +
        'van de lopende maand. Bij opzegging op of na de 15e eindigt de overeenkomst aan het ' +
        'einde van de daaropvolgende maand.\n\n' +
        '4.3 Tussentijdse beëindiging door TAG. TAG is gerechtigd deze overeenkomst per direct ' +
        'of met een door TAG te bepalen termijn te beëindigen indien:\n' +
        '   a. het Lid in strijd handelt met deze overeenkomst of de huisregels (artikel 7);\n' +
        '   b. het Lid zich op een wijze gedraagt die de community, andere leden, medewerkers ' +
        'of de locatie schaadt;\n' +
        '   c. het Lid in verzuim is met betaling en niet binnen 14 dagen na schriftelijke ' +
        'aanmaning alsnog betaalt;\n' +
        '   d. TAG om welke reden dan ook geen toegang meer heeft tot de locatie of de ' +
        'exploitatie van de locatie staakt.\n\n' +
        '4.4 In geval van beëindiging op grond van 4.3.d heeft het Lid recht op terugbetaling ' +
        'van vooruitbetaalde vergoedingen die zien op de periode na de beëindigingsdatum. In ' +
        'overige gevallen van beëindiging is geen restitutie verschuldigd, en heeft het Lid ' +
        'geen recht op schadevergoeding.\n\n' +
        '4.5 Bij beëindiging dient het Lid alle persoonlijke eigendommen mee te nemen en ' +
        'eventuele toegangsmiddelen (sleutels, pasjes, digitale toegang) terug te leveren of in ' +
        'te leveren.',
    },
    {
      title: '5. Diensten en faciliteiten',
      content:
        '5.1 In de maandelijkse vergoeding zijn de volgende diensten en faciliteiten begrepen:\n' +
        '• toegang tot een flexibele werkplek tijdens openingstijden;\n' +
        '• gebruik van gemeenschappelijke ruimtes;\n' +
        '• internetverbinding;\n' +
        '• beheer, beveiliging en schoonmaak van de gemeenschappelijke ruimtes;\n' +
        '• onderhoud van het gebouw en de faciliteiten;\n' +
        '• energieverbruik en afvalverwerking;\n' +
        '• koffie, thee, water en fruit in de gemeenschappelijke ruimtes;\n' +
        '• toegang tot TAG-events en community resources.\n\n' +
        '5.2 TAG mag de samenstelling van de diensten wijzigen, uitbreiden of beperken, voor ' +
        'zover de kern van het aanbod (een werkplek met basisfaciliteiten) intact blijft. TAG ' +
        'informeert het Lid bij wezenlijke wijzigingen.\n\n' +
        '5.3 TAG spant zich in om de diensten beschikbaar te houden, maar geeft geen garantie op ' +
        'ononderbroken beschikbaarheid (bv. internet, koffie, specifieke ruimtes).',
    },
    {
      title: '6. Vergoeding en betaling',
      content:
        `6.1 De maandelijkse vergoeding bedraagt €${CONTRACT_PRICE_EUR},- exclusief ${CONTRACT_VAT_PERCENT}% BTW, voor één ` +
        'flexibele werkplek met bijbehorend dienstenpakket. De vergoeding is maandelijks vooruit ' +
        'verschuldigd, uiterlijk op de eerste dag van elke maand.\n\n' +
        '6.2 Indexering. TAG mag de vergoeding jaarlijks aanpassen op basis van de ' +
        'consumentenprijsindex (CPI) of andere relevante marktfactoren. De eerste aanpassing kan ' +
        'plaatsvinden vanaf de 13e maand, daarna jaarlijks per 1 juli, met een maximum van 5% ' +
        'per jaar. TAG informeert het Lid ten minste twee maanden vooraf.\n\n' +
        '6.3 Geen waarborgsom.\n\n' +
        '6.4 Betaling verloopt via Stripe (creditcard of automatische incasso). Bij niet-tijdige ' +
        'betaling is het Lid van rechtswege in verzuim en is een rente verschuldigd van 1,5% per ' +
        'maand over het openstaande bedrag, vanaf de eerste dag na de vervaldatum. ' +
        'Buitengerechtelijke incassokosten komen voor rekening van het Lid.',
    },
    {
      title: '7. Gebruik en huisregels',
      content:
        '7.1 Het Lid maakt gebruik van de werkplek en faciliteiten als een goed lid van de ' +
        'community: respectvol naar andere leden, medewerkers en de ruimte.\n\n' +
        '7.2 Het Lid houdt zich aan de geldende huisregels van TAG. Deze huisregels zijn ' +
        'beschikbaar op locatie en/of via de TAG-portal en kunnen door TAG van tijd tot tijd ' +
        'worden aangepast.\n\n' +
        '7.3 Het is niet toegestaan om de werkplek of toegang tot de locatie aan derden over te ' +
        'dragen, onder te verhuren of door derden te laten gebruiken zonder voorafgaande ' +
        'schriftelijke toestemming van TAG.\n\n' +
        '7.4 Wijzigingen aan de werkplek of de ruimte mogen alleen met schriftelijke toestemming ' +
        'van TAG worden aangebracht.',
    },
    {
      title: '8. Aansprakelijkheid en verzekering',
      content:
        '8.1 Het Lid is zelf verantwoordelijk voor het verzekeren van eigen eigendommen die naar ' +
        'de locatie worden meegenomen.\n\n' +
        '8.2 TAG is niet aansprakelijk voor verlies, diefstal of beschadiging van persoonlijke ' +
        'eigendommen van het Lid of zijn bezoekers.\n\n' +
        '8.3 De aansprakelijkheid van TAG voor schade die het Lid lijdt als gevolg van een ' +
        'toerekenbare tekortkoming of onrechtmatige daad is beperkt tot directe schade en in ' +
        'totaal beperkt tot het bedrag van drie maanden vergoeding zoals genoemd in artikel 6.1. ' +
        'Aansprakelijkheid voor indirecte schade, gevolgschade, gederfde winst en omzet is ' +
        'uitgesloten.\n\n' +
        '8.4 De beperkingen in 8.3 gelden niet bij opzet of bewuste roekeloosheid van TAG of ' +
        'haar leidinggevenden.\n\n' +
        '8.5 Het Lid vrijwaart TAG voor aanspraken van derden die voortvloeien uit het gebruik ' +
        'door het Lid van de locatie en faciliteiten.',
    },
    {
      title: '9. Privacy en gegevens',
      content:
        'TAG verwerkt persoonsgegevens van het Lid en zijn vertegenwoordiger in lijn met de ' +
        'privacyverklaring van TAG, beschikbaar via de TAG-portal.',
    },
    {
      title: '10. Slotbepalingen',
      content:
        '10.1 Wijzigingen of aanvullingen op deze overeenkomst zijn alleen geldig voor zover ' +
        'schriftelijk overeengekomen.\n\n' +
        '10.2 Indien een bepaling van deze overeenkomst nietig of vernietigbaar blijkt, blijven ' +
        'de overige bepalingen onverminderd van kracht. Partijen zullen de nietige of ' +
        'vernietigde bepaling vervangen door een geldige bepaling die zoveel mogelijk aansluit ' +
        'bij het doel van de oorspronkelijke bepaling.\n\n' +
        '10.3 Op deze overeenkomst is uitsluitend Nederlands recht van toepassing.\n\n' +
        '10.4 Geschillen worden in eerste aanleg voorgelegd aan de bevoegde rechter in het ' +
        'arrondissement Amsterdam.',
    },
    {
      title: '11. Ondertekening',
      content:
        'Door ondertekening bevestigt het Lid akkoord te gaan met de voorwaarden van dit ' +
        'servicecontract en kennis te hebben genomen van de huisregels van TAG.',
    },
  ],
}

const enTemplate: ContractTemplate = {
  title: 'Service Agreement Flexible Workspace',
  versionLabel: 'Version',
  signatureLabel: 'Signed by',
  dateLabel: 'Date',
  sections: [
    {
      title: '1. Parties',
      content:
        'Service Provider: AI AM B.V., KVK number 97054305, trading under the name TAG ' +
        '(hereinafter "TAG" or "Service Provider").\n\n' +
        'Member: {{companyName}}, KVK number {{kvk}}, located in {{city}} ' +
        '(hereinafter "the Member"). Represented by {{representativeName}}.',
    },
    {
      title: '2. Nature of the agreement',
      content:
        '2.1 This agreement is a service agreement. TAG enables the Member to make use of a ' +
        'package of services and facilities as described in article 5, including access to a ' +
        'flexible workspace.\n\n' +
        '2.2 No lease agreement. The parties expressly declare that this agreement does not ' +
        'constitute a lease agreement within the meaning of article 7:230a of the Dutch Civil ' +
        'Code or any other provision of tenancy law. The Member does not obtain any exclusive ' +
        'or sole right of use over a specific area or workspace. Access to a flexible workspace ' +
        'is subordinate to and part of the broader package of services that TAG provides.\n\n' +
        '2.3 The Member confirms that it expressly does not seek tenancy protection and that ' +
        'the provisions of tenancy law do not apply to this agreement.',
    },
    {
      title: '3. Services and access',
      content:
        `3.1 Location: ${CONTRACT_ADDRESS}.\n\n` +
        '3.2 Workspace: the Member has access to one (1) flexible workspace. The Member is not ' +
        'entitled to a specific or fixed workspace; workspaces are assigned based on ' +
        'availability and shared with other members.\n\n' +
        '3.3 Purpose: use is exclusively for business activities relating to the Member’s ' +
        'AI projects.',
    },
    {
      title: '4. Term, renewal and termination',
      content:
        '4.1 This agreement commences on {{startDate}} and is entered into for a term of one ' +
        'month. The agreement is tacitly renewed by one month at a time, until terminated.\n\n' +
        '4.2 Termination must be submitted in writing (email is sufficient) before the 15th of ' +
        'the running month. If submitted on or after the 15th, the agreement ends at the end of ' +
        'the following month.\n\n' +
        '4.3 Early termination by TAG. TAG is entitled to terminate this agreement with ' +
        'immediate effect or with a notice period determined by TAG if:\n' +
        '   a. the Member acts in breach of this agreement or the house rules (article 7);\n' +
        '   b. the Member behaves in a manner that harms the community, other members, staff ' +
        'or the location;\n' +
        '   c. the Member is in default of payment and fails to pay within 14 days after a ' +
        'written reminder;\n' +
        '   d. TAG, for any reason whatsoever, no longer has access to the location or ceases ' +
        'operation of the location.\n\n' +
        '4.4 In the event of termination on the basis of 4.3.d, the Member is entitled to a ' +
        'refund of pre-paid fees covering the period after the termination date. In all other ' +
        'cases of termination no refund is due, and the Member shall not be entitled to any ' +
        'compensation.\n\n' +
        '4.5 Upon termination, the Member must remove all personal belongings and return any ' +
        'access means (keys, passes, digital access).',
    },
    {
      title: '5. Services and facilities',
      content:
        '5.1 The monthly fee includes the following services and facilities:\n' +
        '• access to a flexible workspace during opening hours;\n' +
        '• use of common areas;\n' +
        '• internet connection;\n' +
        '• management, security and cleaning of the common areas;\n' +
        '• maintenance of the building and facilities;\n' +
        '• energy and waste processing;\n' +
        '• coffee, tea, water and fruit in the common areas;\n' +
        '• access to TAG events and community resources.\n\n' +
        '5.2 TAG may modify, expand or limit the composition of the services, provided that ' +
        'the core of the offering (a workspace with basic facilities) remains intact. TAG ' +
        'informs the Member of material changes.\n\n' +
        '5.3 TAG will use reasonable efforts to keep the services available, but does not ' +
        'guarantee uninterrupted availability (e.g. internet, coffee, specific rooms).',
    },
    {
      title: '6. Fee and payment',
      content:
        `6.1 The monthly fee is €${CONTRACT_PRICE_EUR},- excluding ${CONTRACT_VAT_PERCENT}% Dutch VAT, for one flexible ` +
        'workspace with the associated service package. The fee is payable monthly in advance, ' +
        'no later than the first day of each month.\n\n' +
        '6.2 Indexation. TAG may adjust the fee annually based on the consumer price index ' +
        '(CPI) or other relevant market factors. The first adjustment may take place from the ' +
        '13th month, and annually thereafter on July 1st, with a maximum of 5% per year. TAG ' +
        'informs the Member at least two months in advance.\n\n' +
        '6.3 No deposit.\n\n' +
        '6.4 Payment is processed via Stripe (credit card or direct debit). In the event of ' +
        'late payment, the Member is in default by operation of law and shall owe interest of ' +
        '1.5% per month on the outstanding amount, accruing from the first day after the due ' +
        'date. Extrajudicial collection costs are for the account of the Member.',
    },
    {
      title: '7. Use and house rules',
      content:
        '7.1 The Member uses the workspace and facilities as a good member of the community: ' +
        'respectful towards other members, staff and the space.\n\n' +
        '7.2 The Member observes the house rules of TAG in force from time to time. These ' +
        'house rules are available on location and/or via the TAG portal and may be amended by ' +
        'TAG from time to time.\n\n' +
        '7.3 It is not permitted to transfer the workspace or access to the location to third ' +
        'parties, to sub-let it, or to allow third parties to use it without prior written ' +
        'consent from TAG.\n\n' +
        '7.4 Modifications to the workspace or the space may only be made with prior written ' +
        'consent from TAG.',
    },
    {
      title: '8. Liability and insurance',
      content:
        '8.1 The Member is responsible for insuring its own belongings brought to the ' +
        'location.\n\n' +
        '8.2 TAG is not liable for loss, theft or damage to personal belongings of the Member ' +
        'or its visitors.\n\n' +
        '8.3 TAG’s liability for damage suffered by the Member as a result of an ' +
        'attributable failure or unlawful act is limited to direct damage and capped in total ' +
        'at the amount of three months of the fee referred to in article 6.1. Liability for ' +
        'indirect damage, consequential damage, lost profits and lost revenue is excluded.\n\n' +
        '8.4 The limitations in 8.3 do not apply in the event of intent or wilful recklessness ' +
        'on the part of TAG or its executives.\n\n' +
        '8.5 The Member indemnifies TAG against third-party claims arising from the Member’s ' +
        'use of the location and facilities.',
    },
    {
      title: '9. Privacy and data',
      content:
        'TAG processes personal data of the Member and its representative in line with TAG’s ' +
        'privacy statement, available via the TAG portal.',
    },
    {
      title: '10. Final provisions',
      content:
        '10.1 Amendments or additions to this agreement are only valid if agreed in writing.\n\n' +
        '10.2 If a provision of this agreement is or becomes void or voidable, the remaining ' +
        'provisions shall remain in full force. The parties shall replace the void or annulled ' +
        'provision with a valid provision that reflects the purpose of the original provision ' +
        'as closely as possible.\n\n' +
        '10.3 This agreement is governed exclusively by Dutch law.\n\n' +
        '10.4 Disputes shall in the first instance be submitted to the competent court in the ' +
        'Amsterdam district.',
    },
    {
      title: '11. Signature',
      content:
        'By signing, the Member confirms agreement with the terms of this service agreement ' +
        'and confirms it has taken note of TAG’s house rules.',
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
