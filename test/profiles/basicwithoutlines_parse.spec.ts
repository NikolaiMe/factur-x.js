// Tests to Validate the Minimum Profile gets Parsed According to Factur-X Spec
import { DateTime } from 'luxon'
import fs from 'node:fs'
import path from 'node:path'

import { FacturX } from '../../src/index.js'
import { BasicWithoutLinesProfile, isBasicWithoutLinesProfile } from '../../src/profiles/basicwithoutlines/index.js'
import { CountryIDContentType, DOCUMENT_CODES } from '../../src/types/qdt.js'
import { CURRENCY_ID } from '../../src/types/udt.js'

type TestCases = Record<string, BasicWithoutLinesProfile | undefined>

const testCases: TestCases = Object.fromEntries(['BASIC-WL_Einfach'].map(name => [name, undefined]))

beforeAll(async () => {
    for (const name of Object.keys(testCases)) {
        const facturX = await FacturX.fromPDF(fs.readFileSync(path.join(__dirname, 'pdf', `${name}.pdf`)))

        const result = await facturX.getObject()

        console.log(result)

        if (!isBasicWithoutLinesProfile(result)) throw new Error('The profile was not properly chosen')

        testCases[name] = result
    }
})

describe('7.2.2 - ExchangedDocumentContext - Page 43/85 f.', () => {
    describe('BG-2 - PROCESS CONTROL', () => {
        test('BT-23 - Business process type', () => {
            expect(testCases['BASIC-WL_Einfach']?.meta.businessProcessType).toBe(undefined)
        })
        test('BT-24 - Specification identifier', () => {
            expect(testCases['BASIC-WL_Einfach']?.meta.guidelineSpecifiedDocumentContextParameter).toBe(
                'urn:factur-x.eu:1p0:basicwl'
            )
        })
    })
})

describe('7.2.2 - ExchangedDocument - Page 44/85.', () => {
    test('BT-1 - Invoice number', () => {
        expect(testCases['BASIC-WL_Einfach']?.document.id).toBe('TX-471102')
    })

    test('BT-3 - Type Code', () => {
        expect(testCases['BASIC-WL_Einfach']?.document.type).toBe('380')
        expect(testCases['BASIC-WL_Einfach']?.document.type).toBe(DOCUMENT_CODES.COMMERCIAL_INVOICE)
    })

    test('BT-2 - Invoice issue date', () => {
        if (!testCases['BASIC-WL_Einfach']?.document.dateOfIssue) {
            throw new Error('PDF or Document Date undefined')
        }
        expect(testCases['BASIC-WL_Einfach'].document.dateOfIssue.format).toBe('102')
        expect(DateTime.fromJSDate(testCases['BASIC-WL_Einfach'].document.dateOfIssue.date).toISODate()).toBe(
            '2024-11-15'
        )
    })

    describe('BG-1 - INVOICE NOTE', () => {
        test('BT-22 - Invoice note', () => {
            expect(testCases['BASIC-WL_Einfach']?.notes).toHaveLength(3)
            expect(
                testCases['BASIC-WL_Einfach']?.notes?.find(
                    note => note.content === 'Rechnung gemäß Taxifahrt vom 14.11.2024'
                )
            ).not.toBeUndefined()
            expect(
                testCases['BASIC-WL_Einfach']?.notes?.find(note => note.content.includes('Ihre Kundennummer:'))
            ).not.toBeUndefined()
        })
    })

    // BG-1 BT-22
})

describe('7.3.3 - SupplyChainTradeTransaction - Page 44/85 ff.', () => {
    describe('7.3.3.1 - ApplicableHeaderTradeAgreement', () => {
        test('BT-10-00 - Buyer reference', () => {
            expect(testCases['BASIC-WL_Einfach']?.buyer.reference).toBeUndefined()
        })
        describe('BG-4 - SELLER', () => {
            test('BT-27 - Seller name', () => {
                expect(testCases['BASIC-WL_Einfach']?.seller.name).toBe('Taxiunternehmen TX GmbH')
            })
            test('BT-30-00 - Seller legal registration', () => {
                expect(testCases['BASIC-WL_Einfach']?.seller.specifiedLegalOrganization?.id).toBeUndefined()
                expect(testCases['BASIC-WL_Einfach']?.seller.specifiedLegalOrganization?.scheme).toBeUndefined()
            })
            describe('BG-5 - SELLER POSTAL ADDRESS', () => {
                test('BT-40 - Seller country code', () => {
                    expect(testCases['BASIC-WL_Einfach']?.seller.postalAddress.country).toBe(
                        CountryIDContentType.GERMANY
                    )
                })
            })
            test('BT-31-00 - Seller VAT identifier', () => {
                expect(testCases['BASIC-WL_Einfach']?.seller.taxIdentification.localTaxId).toBeUndefined()
                expect(testCases['BASIC-WL_Einfach']?.seller.taxIdentification.vatId).toBe('DE123456789')
            })
        })
        describe('BG-5 - BUYER', () => {
            test('BT-44 - Buyer name', () => {
                expect(testCases['BASIC-WL_Einfach']?.buyer.name).toBe('Taxi-Gast AG Mitte')
            })
            test('BT-47-00 - Buyer legal registration', () => {
                expect(testCases['BASIC-WL_Einfach']?.buyer.specifiedLegalOrganization?.id).toBeUndefined()
                expect(testCases['BASIC-WL_Einfach']?.buyer.specifiedLegalOrganization?.scheme).toBeUndefined()
            })
        })
        test('BT-13-00 - BuyerOrderReferencedDocument', () => {
            expect(testCases['BASIC-WL_Einfach']?.buyer.orderReference).toBeUndefined()
        })
    })
    describe('BG-19 ApplicableHeaderTradeSettlement', () => {
        test('BT-5 - InvoiceCurrencyCode', () => {
            expect(testCases['BASIC-WL_Einfach']?.document.currency).toBe(CURRENCY_ID.Euro)
        })

        describe('7.3.3.3 - ApplicableHeaderTradeSettlement', () => {
            describe('BG-22 SpecifiedTradeSettlementHeaderMonetarySummation', () => {
                test('BT-109 - TaxBasisTotalAmount', () => {
                    expect(testCases['BASIC-WL_Einfach']?.totals.netTotal.amount).toBe(16.9)
                })
                test('BT-110 - TaxTotalAmount', () => {
                    expect(testCases['BASIC-WL_Einfach']?.totals.taxTotal.amount).toBe(1.18)
                })
                test('BT-110-0 - TaxCurrencyCode', () => {
                    expect(testCases['BASIC-WL_Einfach']?.totals.taxTotal.currency).toBe(CURRENCY_ID.Euro)
                })
                test('BT-112 - GrandTotalAmount', () => {
                    expect(testCases['BASIC-WL_Einfach']?.totals.grossTotal.amount).toBe(18.08)
                })
                test('BT-115 - DuePayableAmount', () => {
                    expect(testCases['BASIC-WL_Einfach']?.totals.dueTotal.amount).toBe(18.08)
                })
            })
        })
    })
})