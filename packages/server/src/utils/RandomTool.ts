import { Injectable } from '@nestjs/common';

/**
 * @param randomCode 随机生成四位数字
 * @param randomAvatar 随机生成头像
 * @param randomName 随机生成昵称
 */
@Injectable()
export class RandomTool {
  randomCode() {
    return Math.floor(Math.random() * (9999 - 1000)) + 1000;
  }

  randomAvatar() {
    const baseImgUrl = (num: number) => {
      const _num = num === 0 ? 1 : num > 19 ? 19 : num;
      return `https://xd-video-pc-img.oss-cn-beijing.aliyuncs.com/xdclass_pro/default/head_img/${_num}.jpeg`;
    };
    return baseImgUrl(Math.floor(Math.random() * 20));
  }

  randomName() {
    return `User${Math.floor(Math.random() * 10000)}`;
  }
}