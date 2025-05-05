import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig, redisConfig, jwtConfig } from '../config';
import { UserModule } from './user/user.module';
import { RedisModule } from './utils/modules/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { WechatLoginModule } from './wechat-login/wechat-login.module';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig), 
    UserModule, 
    RedisModule.forRoot(redisConfig),
    JwtModule.register(jwtConfig),
    WechatLoginModule,
    {...TypeOrmModule.forFeature([User]), global: true}
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
