import { test, expect } from '@playwright/test'

import {
  CONTRACT_VERSION,
  contractTemplates,
  renderContractSections,
  type ContractFieldData,
} from '@lib/membership/contract-template'

const exampleFields: ContractFieldData = {
  companyName: 'Notso B.V.',
  kvk: '95131124',
  city: 'Amsterdam',
  representativeName: 'Max Kowalski',
  language: 'nl',
}

test.describe('Contract template', () => {
  test('exposes version 2.0', () => {
    expect(CONTRACT_VERSION).toBe('2.0')
  })

  test('has both NL and EN templates with same section count', () => {
    expect(contractTemplates.nl.sections.length).toBeGreaterThan(0)
    expect(contractTemplates.en.sections.length).toBe(
      contractTemplates.nl.sections.length
    )
  })

  test('renders NL fields into Partijen section', () => {
    const rendered = renderContractSections(exampleFields, new Date('2026-04-13'))
    const partijen = rendered.sections.find((s) => s.title.startsWith('1.'))

    expect(partijen).toBeDefined()
    expect(partijen!.content).toContain('Notso B.V.')
    expect(partijen!.content).toContain('95131124')
    expect(partijen!.content).toContain('Amsterdam')
    expect(partijen!.content).toContain('Max Kowalski')
  })

  test('renders EN fields into Parties section', () => {
    const rendered = renderContractSections(
      { ...exampleFields, language: 'en' },
      new Date('2026-04-13')
    )
    const parties = rendered.sections.find((s) => s.title.startsWith('1.'))

    expect(parties).toBeDefined()
    expect(parties!.content).toContain('Notso B.V.')
    expect(parties!.content).toContain('95131124')
    expect(parties!.content).toContain('Amsterdam')
    expect(parties!.content).toContain('Sub-lessor')
  })

  test('formats start date in chosen locale', () => {
    const date = new Date('2026-04-13')
    const renderedNL = renderContractSections(exampleFields, date)
    const renderedEN = renderContractSections(
      { ...exampleFields, language: 'en' },
      date
    )

    const dateSectionNL = renderedNL.sections.find((s) => s.title.startsWith('3.'))
    const dateSectionEN = renderedEN.sections.find((s) => s.title.startsWith('3.'))

    // NL: e.g. "13 april 2026"; EN: "13 April 2026"
    expect(dateSectionNL!.content).toMatch(/13 april 2026/)
    expect(dateSectionEN!.content).toMatch(/13 April 2026/)
  })

  test('mentions €150 excl. BTW in NL', () => {
    const rendered = renderContractSections(exampleFields, new Date())
    const pricing = rendered.sections.find((s) => s.title.startsWith('4.'))
    expect(pricing!.content).toContain('€150')
    expect(pricing!.content).toContain('exclusief 21% BTW')
  })

  test('mentions sub-lessor termination clause', () => {
    const rendered = renderContractSections(exampleFields, new Date())
    const termClause = rendered.sections.find((s) => s.title.startsWith('3.'))
    expect(termClause!.content).toContain('hoofdverhuurder')
  })
})
