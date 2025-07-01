import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from '../../infra/jwt/strategies/jwt.strategy';
import { UserModule } from '../user/user.module';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
    UserModule,
  ],
  providers: [AuthResolver, AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
