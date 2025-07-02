import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Audit } from '../../core/decorators/audit.decorator';
import { Auth, ModeratorOrAdmin } from '../../core/decorators/auth.decorators';
import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';

import { UpdateUserInput } from './dto/user.input';
import { UserModel } from './models/user.model';
import { UserService } from './user.service';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserModel)
  @Auth()
  @Audit({ action: AuditLogAction.USER_READ, resource: 'user' })
  async user(@Args('id') id: string): Promise<UserModel> {
    return this.userService.getUserById(id);
  }

  @Query(() => [UserModel])
  @ModeratorOrAdmin()
  @Audit({ action: AuditLogAction.USER_READ, resource: 'user' })
  async users(): Promise<UserModel[]> {
    return this.userService.getUsers();
  }

  @Mutation(() => UserModel)
  @Auth()
  @Audit({ action: AuditLogAction.USER_UPDATE, resource: 'user' })
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserModel> {
    return this.userService.updateUser(id, input);
  }

  @Mutation(() => Boolean)
  @Auth()
  @Audit({ action: AuditLogAction.USER_DELETE, resource: 'user' })
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    await this.userService.delete(id);
    return true;
  }
}
