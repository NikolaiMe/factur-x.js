import { z } from 'zod'

import { BaseTypeConverter, TypeConverterError } from '../BaseTypeConverter'

export const ZIdTypeWithScheme = z.object({
    id: z.string(),
    scheme: z.string().optional()
})

export type IdTypeWithScheme = z.infer<typeof ZIdTypeWithScheme>

export const ZIdTypeWithSchemeXml = z.object({
    '#text': z.string(),
    '@schemeID': z.string().optional()
})

export type IdTypeWithSchemeXml = z.infer<typeof ZIdTypeWithSchemeXml>

export class IdTypeWithSchemeConverter extends BaseTypeConverter<IdTypeWithScheme> {
    fromXML(xml: IdTypeWithSchemeXml) {
        const id = xml['#text']
        if (!id) {
            throw new TypeConverterError('INVALID_XML')
        }

        return new IdTypeWithSchemeConverter({
            id,
            scheme: xml['@schemeID']
        }) as this // cast to this
    }

    toXML(): IdTypeWithSchemeXml {
        if (!this.value) {
            throw new TypeConverterError('NO_VALUE')
        }

        return {
            '#text': this.value.id,
            '@schemeID': this.value.scheme
        }
    }

    // TODO: validate(validSchemes: string[]): boolean
}
