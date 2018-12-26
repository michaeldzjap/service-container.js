import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import {isUndefined} from '@src/Support/helpers';
import {DESIGN_PARAM_TYPES} from '@src/Constants/metadata';

/**
 * Define the type metadata if it not already exists.
 *
 * @param {Object[]} arr
 * @param {ParameterDescriptor[]} data
 * @returns {void}
 */
export const defineMetadata = (arr: {target: any, propertyKey?: string}[],
    data: ParameterDescriptor[]): void => {
    arr.forEach(({target, propertyKey}): void => {
        if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
            isUndefined(propertyKey)
                ? Reflect.defineMetadata(
                    DESIGN_PARAM_TYPES,
                    data.map((_: ParameterDescriptor): any => _.type),
                    target,
                )
                : Reflect.defineMetadata(
                    DESIGN_PARAM_TYPES,
                    data.map((_: ParameterDescriptor): any => _.type),
                    target,
                    propertyKey
                );
        }
    });
};
