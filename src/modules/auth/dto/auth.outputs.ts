import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '../models/user.model';

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class MessageResponse {
  @Field()
  message: string;
}
