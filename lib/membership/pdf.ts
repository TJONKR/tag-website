import ReactPDF from '@react-pdf/renderer'
import React from 'react'

import { contractSections, CONTRACT_VERSION } from './contract-template'

const { Document, Page, Text, View, StyleSheet, renderToBuffer } = ReactPDF

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
  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.header }, 'TAG Builder Membership Agreement'),
      React.createElement(Text, { style: styles.subheader }, `Version ${CONTRACT_VERSION}`),
      ...contractSections.map((section) =>
        React.createElement(
          View,
          { key: section.title },
          React.createElement(Text, { style: styles.sectionTitle }, section.title),
          React.createElement(Text, { style: styles.sectionContent }, section.content)
        )
      ),
      React.createElement(
        View,
        { style: styles.signature },
        React.createElement(Text, { style: styles.signatureLabel }, 'Signed by'),
        React.createElement(Text, { style: styles.signatureValue }, memberName || memberEmail),
        React.createElement(Text, { style: styles.signatureLabel }, `Email: ${memberEmail}`),
        React.createElement(
          Text,
          { style: styles.signatureLabel },
          `Date: ${signedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
        )
      )
    )
  )

  return await renderToBuffer(doc)
}
