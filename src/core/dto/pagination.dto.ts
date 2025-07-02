import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

@InputType()
export class SortInput {
  @Field({ description: 'Field to sort by' })
  @ApiProperty({
    description: 'Field name to sort by',
    example: 'createdAt',
  })
  @IsString({ message: 'Sort field must be a string' })
  field: string;

  @Field(() => SortOrder, { 
    nullable: true, 
    description: 'Sort order (ASC or DESC)',
    defaultValue: SortOrder.ASC,
  })
  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
    required: false,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  order?: SortOrder = SortOrder.ASC;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { 
    nullable: true, 
    description: 'Page number (1-based)',
    defaultValue: 1,
  })
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    maximum: 1000,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Max(1000, { message: 'Page must not exceed 1000' })
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page?: number = 1;

  @Field(() => Int, { 
    nullable: true, 
    description: 'Number of items per page',
    defaultValue: 20,
  })
  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Transform(({ value }) => parseInt(value, 10) || 20)
  limit?: number = 20;

  @Field(() => [SortInput], { 
    nullable: true, 
    description: 'Sort criteria',
  })
  @ApiProperty({
    description: 'Array of sort criteria',
    type: [SortInput],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Sort must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SortInput)
  sort?: SortInput[];
}

@ObjectType()
export class PageInfo {
  @Field(() => Int, { description: 'Current page number' })
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @Field(() => Int, { description: 'Number of items per page' })
  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  pageSize: number;

  @Field(() => Int, { description: 'Total number of items' })
  @ApiProperty({
    description: 'Total number of items',
    example: 150,
  })
  totalItems: number;

  @Field(() => Int, { description: 'Total number of pages' })
  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;

  @Field({ description: 'Whether there is a next page' })
  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @Field({ description: 'Whether there is a previous page' })
  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;
}

@ObjectType()
export abstract class PaginatedResponse<T> {
  @Field(() => PageInfo, { description: 'Pagination information' })
  @ApiProperty({
    description: 'Pagination information',
    type: PageInfo,
  })
  pageInfo: PageInfo;

  abstract items: T[];
}

/**
 * Helper function to create paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  pagination: PaginationInput,
): { items: T[]; pageInfo: PageInfo } {
  const { page = 1, limit = 20 } = pagination;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    pageInfo: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Helper function to calculate offset for database queries
 */
export function calculateOffset(pagination: PaginationInput): number {
  const { page = 1, limit = 20 } = pagination;
  return (page - 1) * limit;
}

/**
 * Helper function to build sort clause for database queries
 */
export function buildSortClause(sort?: SortInput[]): Record<string, 'asc' | 'desc'> {
  if (!sort || sort.length === 0) {
    return { createdAt: 'desc' }; // Default sort
  }

  const sortClause: Record<string, 'asc' | 'desc'> = {};
  sort.forEach(({ field, order }) => {
    sortClause[field] = order?.toLowerCase() as 'asc' | 'desc' || 'asc';
  });

  return sortClause;
}

/**
 * Validate sort fields against allowed fields
 */
export function validateSortFields(sort: SortInput[], allowedFields: string[]): void {
  if (!sort) return;

  const invalidFields = sort
    .map(s => s.field)
    .filter(field => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    throw new Error(`Invalid sort fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`);
  }
}
