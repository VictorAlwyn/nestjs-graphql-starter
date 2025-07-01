import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsString()
  name?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;
}
