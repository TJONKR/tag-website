import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { createElement } from 'react'

import { contractSections, CONTRACT_VERSION } from './contract-template'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 10,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 6,
  },
  sectionContent: {
    lineHeight: 1.6,
    color: '#333',
  },
  signature: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  signatureValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
})

export async function generateContractPdf(
  memberName: string,
  memberEmail: string,
  signedAt: Date
): Promise<Buffer> {
  const doc = createElement(
    Document,
    null,
    createElement(
      Page,
      { size: 'A4', style: styles.page },
      createElement(Text, { style: styles.header }, 'TAG Builder Membership Agreement'),
      createElement(Text, { style: styles.subheader }, `Version ${CONTRACT_VERSION}`),
      ...contractSections.map((section) =>
        createElement(
          View,
          { key: section.title },
          createElement(Text, { style: styles.sectionTitle }, section.title),
          createElement(Text, { style: styles.sectionContent }, section.content)
        )
      ),
      createElement(
        View,
        { style: styles.signature },
        createElement(Text, { style: styles.signatureLabel }, 'Signed by'),
        createElement(Text, { style: styles.signatureValue }, memberName || memberEmail),
        createElement(Text, { style: styles.signatureLabel }, `Email: ${memberEmail}`),
        createElement(
          Text,
          { style: styles.signatureLabel },
          `Date: ${signedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
        )
      )
    )
  )

  return await renderToBuffer(doc)
}
