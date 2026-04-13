import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { createElement } from 'react'

import {
  CONTRACT_VERSION,
  renderContractSections,
  type ContractFieldData,
} from './contract-template'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 9,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 4,
  },
  sectionContent: {
    lineHeight: 1.5,
    color: '#333',
  },
  signature: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  signatureValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
})

export async function generateContractPdf(
  fields: ContractFieldData,
  memberEmail: string,
  signedAt: Date
): Promise<Buffer> {
  const template = renderContractSections(fields, signedAt)

  const dateLocale = fields.language === 'nl' ? 'nl-NL' : 'en-GB'
  const formattedDate = signedAt.toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const doc = createElement(
    Document,
    null,
    createElement(
      Page,
      { size: 'A4', style: styles.page },
      createElement(Text, { style: styles.header }, template.title),
      createElement(
        Text,
        { style: styles.subheader },
        `${template.versionLabel} ${CONTRACT_VERSION}`
      ),
      ...template.sections.map((section) =>
        createElement(
          View,
          { key: section.title, wrap: false },
          createElement(Text, { style: styles.sectionTitle }, section.title),
          createElement(Text, { style: styles.sectionContent }, section.content)
        )
      ),
      createElement(
        View,
        { style: styles.signature },
        createElement(Text, { style: styles.signatureLabel }, template.signatureLabel),
        createElement(
          Text,
          { style: styles.signatureValue },
          `${fields.representativeName} — ${fields.companyName}`
        ),
        createElement(Text, { style: styles.signatureLabel }, `Email: ${memberEmail}`),
        createElement(Text, { style: styles.signatureLabel }, `KVK: ${fields.kvk}`),
        createElement(
          Text,
          { style: styles.signatureLabel },
          `${template.dateLabel}: ${formattedDate}`
        )
      )
    )
  )

  return await renderToBuffer(doc)
}
