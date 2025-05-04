import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CaptchaDto } from './dto/captcha.dto';
import { GetUserIp, GetUserAgent } from '../utils/GetUserMessTool';
import { SecretTool } from '../utils/SecretTool';
import { SendCodeDto } from './dto/sendCode.dto';
import { RandomTool } from '../utils/RandomTool';
import { RegisterDto } from './dto/Register.dto';
import { PasswordLoginDto, SmsLoginDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly secretTool: SecretTool,
    private readonly randomTool: RandomTool,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  /**
* 图形验证码控制器
*/
  @Post('captcha')
  async getCaptcha(
    @Body() body: CaptchaDto,
    @GetUserIp() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const { type } = body;
    // 用户的ip+设备加密
    const _key = this.secretTool.getSecret(ip + agent);
    return this.userService.getCaptcha(_key, type);
  }


  /**
 * 短信验证码控制器
 */
  @Post('send_code')
  async sendCode(
    @Body() body: SendCodeDto,
    @GetUserIp() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const { phone, captcha, type } = body;
    // 用户的ip+设备加密
    const _key = this.secretTool.getSecret(ip + agent);
    return this.userService.sendCode(
      phone,
      captcha,
      type,
      _key,
      this.randomTool.randomCode(),
    );
  }


  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { phone, sendCode, password, confirm } = body;
    return this.userService.register(phone, sendCode, password, confirm);
  }

  @Post('password_login')
  async passwordLogin(@Body() body: PasswordLoginDto) {
    const { phone, password } = body;
    return this.userService.passwordLogin({ phone, password });
  }

  @Post('sms_login')
  async smsLogin(@Body() body: SmsLoginDto) {
    const { phone, sendCode } = body;
    return this.userService.smsLogin({phone, sendCode});
  }



}
