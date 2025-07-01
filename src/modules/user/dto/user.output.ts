import { Field, ObjectType } from '@nestjs/graphql';

import { UserModel } from '../models/user.model';

@ObjectType()
export class UserResponse {
  @Field(() => UserModel)
  user: UserModel;

  @Field()
  message: string;
}

@ObjectType()
export class DeleteUserResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
