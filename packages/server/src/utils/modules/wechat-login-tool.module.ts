import { Module } from "@nestjs/common";
import type { DynamicModule } from '@nestjs/common';

export interface weChatLoginConfig {
    appID: string;
    appSecret: string;
    qrUrl: string;
    token: string;
}


@Module({})
export class WechatLoginToolModule {
    private config: weChatLoginConfig;
    private accessTokenPC: string;
    token: string;
    constructor(config: weChatLoginConfig) {
        this.config = config;
        this.token = config.token;
        this.accessTokenPC = `https://api-v2.xdclass.net/cgi-bin/token?grant_type=client_credential&appid=${config.appID}&secret=${config.appSecret}`
    }

    static forRoot(options: weChatLoginConfig): DynamicModule {
        const providers = [
            {
                provide: WechatLoginToolModule,
                useValue: new WechatLoginToolModule(options),
            },
        ]

        return {
            providers,
            global: true,
            exports: providers,
            module: WechatLoginToolModule,
        }
    }

    // 请求微信服务器获取 access_token
    async getAccessToken() {
        const response = await fetch(this.accessTokenPC)
        return response.json()
    }

    async getTicket(token: string) {
        const response = await fetch(
            `https://api-v2.xdclass.net/cgi-bin/qrcode/create?access_token=${token}`,
            {
                method: 'post',
                body: JSON.stringify({
                    expire_seconds: 60 * 2,
                    action_name: 'QR_SCENE',
                    action_info: {
                        scene: { scene_id: 123 },
                    },
                }),
            },
        )
        return response.json()
    }

    async getOR() {
        const token = (await this.getAccessToken()).access_token
        const ticket = (await this.getTicket(token)).ticket
        return { qrcodeUrl: `${this.config.qrUrl}?ticket=${ticket}`, ticket }
    }



}
