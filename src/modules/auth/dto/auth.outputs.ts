import { Field, ObjectType } from '@nestjs/graphql';

import { UserModel } from '../../user/models/user.model';

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => UserModel)
  user: UserModel;
}

@ObjectType()
export class MessageResponse {
  @Field()
  message: string;
}

export { UserModel };
