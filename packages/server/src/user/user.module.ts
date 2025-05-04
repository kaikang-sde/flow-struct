import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CaptchaTool } from '../utils/CaptchaTool';
import { SecretTool } from '../utils/SecretTool';
import { TextMessageTool } from '../utils/TextMessageTool';
import { RandomTool } from '../utils/RandomTool';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, CaptchaTool, SecretTool, TextMessageTool, RandomTool],
})
export class UserModule {}
