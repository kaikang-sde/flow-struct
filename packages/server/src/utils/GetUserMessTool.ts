/**
 * 自定义参数装饰器
 * GetUserIp 从Request中获取用户的ip
 * GetUserAgent 从Request中获取用户的UA
 */
import type { ExecutionContext } from '@nestjs/common'; // 执行上下文的类型
import { createParamDecorator } from '@nestjs/common'; // 用于创建自定义参数装饰器

const GetUserIp = createParamDecorator((data, ctx: ExecutionContext) => {
    // 获取当前 HTTP 请求对象
    const request = ctx.switchToHttp().getRequest();
    // 从请求对象中获取用户的IP地址，使用正则表达式匹配 IPv4 地址，并将其转换为字符串
    return request.ip.match(/\d+\.\d+\.\d+\.\d+/)?.join('.');
});

const GetUserAgent = createParamDecorator((data, ctx: ExecutionContext) => {
    // 获取当前 HTTP 请求对象
    const request = ctx.switchToHttp().getRequest();
    // 获取请求对象的头部信息
    return request.headers['user-agent'];
});


export { GetUserIp, GetUserAgent };