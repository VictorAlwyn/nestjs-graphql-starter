import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

/**
 * Custom validation decorator for password confirmation
 */
export function IsPasswordConfirmed(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordConfirmed',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}

/**
 * Custom validation decorator for file size
 */
export function IsFileSizeValid(
  maxSizeInBytes: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFileSizeValid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxSizeInBytes],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value || !value.size) return true;
          return value.size <= maxSizeInBytes;
        },
        defaultMessage(args: ValidationArguments) {
          const [maxSize] = args.constraints;
          return `File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`;
        },
      },
    });
  };
}

/**
 * Custom validation decorator for file type
 */
export function IsFileTypeValid(
  allowedTypes: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFileTypeValid',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedTypes],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value || !value.mimetype) return true;
          return allowedTypes.includes(value.mimetype);
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedTypes] = args.constraints;
          return `File type must be one of: ${allowedTypes.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Custom validation decorator for URL validation with specific protocols
 */
export function IsUrlWithProtocol(
  protocols: string[] = ['http', 'https'],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUrlWithProtocol',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [protocols],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true;
          try {
            const url = new URL(value);
            return protocols.includes(url.protocol.slice(0, -1));
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const [protocols] = args.constraints;
          return `URL must use one of these protocols: ${protocols.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Custom validation decorator for phone number
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true;
          // Basic international phone number regex
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        },
        defaultMessage() {
          return 'Phone number must be a valid international format';
        },
      },
    });
  };
}

/**
 * Custom validation decorator for date range
 */
export function IsDateAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          
          if (!value || !relatedValue) return true;
          
          const date1 = new Date(value);
          const date2 = new Date(relatedValue);
          
          return date1 > date2;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}

/**
 * Custom validation decorator for array length
 */
export function IsArrayLengthBetween(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isArrayLengthBetween',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) return false;
          return value.length >= min && value.length <= max;
        },
        defaultMessage(args: ValidationArguments) {
          const [min, max] = args.constraints;
          return `Array must contain between ${min} and ${max} items`;
        },
      },
    });
  };
}

/**
 * Validator constraint for checking if email is unique
 */
@ValidatorConstraint({ name: 'isEmailUnique', async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  async validate(email: string): Promise<boolean> {
    // This would typically check against the database
    // For now, we'll return true as this should be implemented
    // in the service layer with proper database access
    return true;
  }

  defaultMessage(): string {
    return 'Email address is already in use';
  }
}

/**
 * Custom validation decorator for unique email
 */
export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}

/**
 * Custom validation decorator for JSON string
 */
export function IsJsonString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isJsonString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true;
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          return 'Value must be a valid JSON string';
        },
      },
    });
  };
}

/**
 * Custom validation decorator for base64 string
 */
export function IsBase64String(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBase64String',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true;
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
          return base64Regex.test(value) && value.length % 4 === 0;
        },
        defaultMessage() {
          return 'Value must be a valid base64 string';
        },
      },
    });
  };
}
