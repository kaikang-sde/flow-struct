import { Controller, Get, Post, Query, Body} from '@nestjs/common';
import { WechatLoginService } from './wechat-login.service';
import {CallbackInsertRequest} from '@flow-struct/share';

@Controller('wechat')
export class WechatLoginController {
  constructor(private readonly wechatLoginService: WechatLoginService) {}

  // 微信介入验证
  @Get('callback')
  insert(@Query() params: CallbackInsertRequest) {
    return this.wechatLoginService.insert(params);
  }

  // 获取二维码
  @Get('login')
  login() {
    return this.wechatLoginService.login();
  }

  // 接收微信回调的用户信息
  @Post('callback')
  wechatMessage(@Body() body) {
    return this.wechatLoginService.wechatMessage(body);
  }

  // 轮询用户是否扫码
  @Get('check_scan')
  checkScan(@Query() body:{ticket:string}) {
    return this,this.wechatLoginService.checkScan(body);
    
  }




}
