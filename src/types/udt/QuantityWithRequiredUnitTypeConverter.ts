import { z } from 'zod'

import { BaseTypeConverter, TypeConverterError } from '../BaseTypeConverter'
import { UNIT_CODES } from '../codes'

export const ZQuantityWithRequiredUnitType = z.object({
    quantity: z.number(),
    unit: z.nativeEnum(UNIT_CODES)
})

export type QuantityWithRequiredUnitType = z.infer<typeof ZQuantityWithRequiredUnitType>

export const ZQuantityWithRequiredUnitTypeXml = z.object({
    '#text': z.string(),
    '@unitCode': z.string()
})

export type QuantityWithRequiredUnitTypeXml = z.infer<typeof ZQuantityWithRequiredUnitTypeXml>

export class QuantityWithRequiredUnitTypeConverter extends BaseTypeConverter<
    QuantityWithRequiredUnitType,
    QuantityWithRequiredUnitTypeXml
> {
    _toValue(xml: QuantityWithRequiredUnitTypeXml) {
        const { success, data } = ZQuantityWithRequiredUnitTypeXml.safeParse(xml)
        if (!success) {
            throw new TypeConverterError('INVALID_XML')
        }

        const quantity = parseFloat(data['#text'])
        if (quantity == null || isNaN(quantity)) {
            throw new TypeConverterError('INVALID_XML')
        }

        const value = {
            quantity,
            currency: data['@unitCode'] as UNIT_CODES
        }

        const { success: success_val, data: data_val } = ZQuantityWithRequiredUnitType.safeParse(value)
        if (!success_val) {
            throw new TypeConverterError('INVALID_XML')
        }

        return data_val
    }

    _toXML(value: QuantityWithRequiredUnitType): QuantityWithRequiredUnitTypeXml {
        const { success, data } = ZQuantityWithRequiredUnitType.safeParse(value)

        if (!success) {
            throw new TypeConverterError('INVALID_VALUE')
        }

        return {
            '#text': data.quantity.toFixed(2),
            '@unitCode': data.unit
        }
    }
}
