import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserRole } from '../../../infra/database/schemas/better-auth.schema';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role enumeration',
});

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
