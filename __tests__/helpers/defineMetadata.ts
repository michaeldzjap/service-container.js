import ParameterDescriptor from '@src/Descriptors/ParameterDescriptor';
import {isUndefined} from '@src/Support/helpers';
import {DESIGN_PARAM_TYPES} from '@src/Constants/metadata';

/**
 * Define the type metadata if it not already exists.
 *
 * @param {Object[]} arr
 * @returns {void}
 */
export const defineMetadata = (arr: {target: any, propertyKey?: string}[]): void => {
    arr.forEach(({target, propertyKey}): void => {
        if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
            isUndefined(propertyKey)
                ? Reflect.defineMetadata(
                    DESIGN_PARAM_TYPES,
                    EXPECTED.map((_: ParameterDescriptor): any => _.type),
                    target,
                )
                : Reflect.defineMetadata(
                    DESIGN_PARAM_TYPES,
                    EXPECTED.map((_: ParameterDescriptor): any => _.type),
                    target,
                    propertyKey
                );
        }
    });
};
