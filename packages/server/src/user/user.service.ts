import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaTool } from '../utils/CaptchaTool';
import { RedisModule } from '../utils/modules/redis.module';
import * as dayjs from 'dayjs';
import { TextMessageTool } from '../utils/TextMessageTool';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RandomTool } from '../utils/RandomTool';
import { SecretTool } from 'src/utils/SecretTool';
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class UserService {
  constructor(
    private readonly captchaTool: CaptchaTool,
    private readonly redis: RedisModule,
    private readonly textMessageTool: TextMessageTool,
    private readonly randomTool: RandomTool,
    private readonly secretTool: SecretTool,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  /**
   * 图形验证码服务
   */
  async getCaptcha(key: string, type: string) {
    const svgCaptcha = await this.captchaTool.captche();
    this.redis.set(`${type}:captcha:${key}`, svgCaptcha.text, 60);
    return { data: svgCaptcha.data, text: svgCaptcha.text };
  }

  /**
   * 手机验证码服务
   * @param phone 手机
   * @param captcha 图形验证码
   * @param type 类型
   * @param key key
   * @param randomCode 随机验证码
   */
  async sendCode(
    phone: string,
    captcha: string,
    type: string,
    key: string,
    randomCode: number,
  ) {
    // 60秒内不能重复获取
    if (await this.redis.exists(`${type}:code:${phone}`)) {
      const dateRedis = dayjs(
        Number((await this.redis.get(`${type}:code:${phone}`))!.split('_')[0]),
      )
      if (dayjs(Date.now()).diff(dateRedis, 'second') <= 60)
        throw new BadRequestException('Please do not repeat the SMS verification code')
    }
    // 是否有图形验证
    if (!(await this.redis.exists(`${type}:captcha:${key}`)))
      throw new BadRequestException('Please get a graph verification code first')
    if (!captcha)
      throw new BadRequestException('Please enter the graph verification code')

    // 对比用户的图形验证码和redis储存的是否一致
    const captchaRedis = await this.redis.get(`${type}:captcha:${key}`)
    if (!(String(captcha).toLowerCase() === captchaRedis!.toLowerCase()))
      throw new BadRequestException('Graph verification code incorrect')
    // 发送手机验证码
    const codeRes = (await this.textMessageTool.sendMsgCode(phone, randomCode))

    // 获取当前时间拼接验证码
    const randomCodeTime = `${Date.now()}_${randomCode}`
    this.redis.set(`${type}:code:${phone}`, randomCodeTime, 60)

    // 删除图形验证码
    this.redis.del(`${type}:captcha:${key}`)
    if (codeRes.code === 0) {
      return null
    }
    else {
      this.redis.del(`${type}:code:${phone}`)
      throw new BadRequestException('Fail to send, please try again')
    }
  }


  /**
   * 注册服务
   * @param phone 账号
   * @param sendCode 验证码
   * @param password 密码
   * @param confirm 确认密码
   */
  async register(
    phone: string,
    sendCode: string,
    password: string,
    confirm: string,
  ) {
    // 手机号注册查重
    const existUser = await this.userRepository.findOne({ where: { phone } })
    if (existUser)
      throw new BadRequestException('The phone number has been registered')

    // 获取redis中的验证码和用户传入的进行对比
    if (await this.redis.exists(`register:code:${phone}`)) {
      const codeRes = (await this.redis.get(`register:code:${phone}`))!.split('_')[1]

      if (!(sendCode === codeRes))
        throw new BadRequestException('The SMS verification code is incorrect')
    }
    else {
      throw new BadRequestException('Please get a SMS verification code first')
    }

    // 验证二次密码
    if (password !== confirm)
      throw new BadRequestException('The two passwords entered are inconsistent')

    // 随机生成头像和昵称
    const name = this.randomTool.randomName()
    const avatar = this.randomTool.randomAvatar()

    // 生成加密密码
    const pwd = this.secretTool.getSecret(`${password}`)

    // 将新用户数据插入数据库
    const user = await this.userRepository.save({
      username: name,
      head_img: avatar,
      phone,
      password: pwd,
      open_id: '',
    })

    // 生成token 7天过期
    const token = this.jwtService.sign({ id: user.id })

    return {
      data: token,
      msg: 'Register successfully!',
    }
  }

  /**
   * 账号密码登录服务
   */
  async passwordLogin({ phone, password }) {
    // 查找用户是否注册过
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) {
      throw new BadRequestException('The account does not exist');
    }
    // 检查密码是否正确
    const isPasswordValid =
      this.secretTool.getSecret(password) === foundUser.password;
    if (!isPasswordValid) {
      throw new BadRequestException('The password is incorrect');
    }

    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: 'Login successfully!',
    };
  }


  /**
   * 验证码登录服务
   */
  async smsLogin({ phone, sendCode }) {
    // 查找用户是否注册过
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) {
      throw new BadRequestException('The account or password is incorrect!');
    }
    // 检查是否获取手机验证码
    const codeExist = await this.redis.exists(`login:code:${phone}`);
    if (!codeExist) throw new BadRequestException('Please get a SMS verification code first!' );

    // 检查手机验证码是否正确
    const codeRes = (await this.redis.get(`login:code:${phone}`))!.split(
      '_',
    )[1];
    if (codeRes !== sendCode) throw new BadRequestException('The SMS verification code is incorrect!');

    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功！',
    };
  }



}
