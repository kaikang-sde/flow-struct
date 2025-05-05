import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto'
import { WechatLoginToolModule } from '../utils/modules/wechat-login-tool.module';
import { CallbackInsertRequest } from '@flow-struct/share';
import { RedisModule } from '../utils/modules/redis.module';
import { WechatDataTool } from '../utils/WechatDataTool';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RandomTool } from 'src/utils/RandomTool';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class WechatLoginService {
  constructor(
    private readonly wechatLoginToolModule: WechatLoginToolModule,
    private readonly redis: RedisModule,
    private readonly wechatDataTool: WechatDataTool,
    private readonly randomTool: RandomTool,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  // 微信服务介入验证
  insert(params: CallbackInsertRequest) {
    const { signature, timestamp, nonce, echostr } = params
    // 微信服务的token
    const token = this.wechatLoginToolModule.token
    // 将token、timestamp、nonce三个参数进行字典序排序,拼接成一个字符串,进行sha1加密
    const str = [token, timestamp, nonce].sort().join('')
    const hash = createHash('sha1')
    hash.update(str)
    const encryptedData = hash.digest('hex')
    // 获得加密后的字符串可与signature对比，验证标识该请求来源于微信服务器
    if (encryptedData === signature) {
      // 确认此次GET请求来自微信服务器，原样返回echostr参数内容，则接入生效
      return {
        data: echostr,
        msg: 'wechat validation callback',
      }
    }
  }

  // 获取微信二维码服务
  async login() {
    const { qrcodeUrl, ticket } = await this.wechatLoginToolModule.getOR();

    // 将 ticket作为key值，{ isScan : false } 转成 json 存入Redis缓存
    const key = `wechat:ticket:${ticket}`;
    this.redis.set(key, JSON.stringify({ isScan: 'no' }), 120);
    return { qrcodeUrl, ticket };
  }

  // 微信调用
  async wechatMessage(body) {
    interface IObjectData {
      xml: object
    }
    console.log(body);
    const xmlData = Object.keys(body)[0];
    const objectData = await this.wechatDataTool.getObject(xmlData) as IObjectData;
    const lastData = this.wechatDataTool.getLastData(objectData.xml);
    console.log(objectData);
    const openIdRes = await this.userRepository.findOne({ where: { open_id: lastData.FromUserName } });

    const username = this.randomTool.randomName()
    const head_img = this.randomTool.randomAvatar()
    let userId: number | null = null;

    if (openIdRes) {
      userId = openIdRes.id;
    } else {
      const resData = await this.userRepository.save({
        username,
        head_img,
        open_id: lastData.FromUserName,
        phone: '',
        password: '',
      });
      userId = resData.id;
    }

    const token = this.jwtService.sign({ id: userId });

    const key = `wechat:ticket:${lastData.Ticket}`;
    const ticketRes = await this.redis.get(key);
    const existKey = await this.redis.exists(key);

    if (existKey)
      this.redis.set(key, JSON.stringify({ isScan: 'yes', token }), 120)

    // 返回微信服务器的内容
    let content = ''
    if (lastData.MsgType === 'event') {
      if (lastData.Event === 'SCAN')
        content = 'Welcome back!'
      else if (lastData.Event === 'subscribe')
        content = 'Thanks for subscribing!'

      const msgStr = `<xml>
        <ToUserName><![CDATA[${lastData.FromUserName}]]></ToUserName>
        <FromUserName><![CDATA[${lastData.ToUserName}]]></FromUserName>
        <CreateTime>${Date.now()}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${content}]]></Content>
       </xml>`
      return {
        data: msgStr,
        msg: 'wechat validation callback',
      }

    }
  }

  /**
* 轮训用户是否扫码服务
*/
  async checkScan(param: { ticket: string }) {
    const { ticket } = param;
    const key = `wechat:ticket:${ticket}`;
    const redisData = JSON.parse((await this.redis.get(key)) as string);
    if (redisData && redisData.isScan === 'yes') {
      const { token } = redisData;
      return {
        msg: 'Login successfully!',
        data: token,
      };
    }else {
      return {
        msg: 'Please scan the QR code first',
      };
    }
  }

}