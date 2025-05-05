import { Injectable } from '@nestjs/common'
import { parseString } from 'xml2js'

/**
 * @param getXMLStr 以流的形式处理微信的参数
 * @param getObject 将XML的数据转成对象形式
 * @param getLastData 将数据优化成普通对象
 */
@Injectable()
export class WechatDataTool {
    getXMLStr(req: any) {
        return new Promise((resolve) => {
            let data = ''
            req.on('data', (msg: any) => {
                data += msg.toString()
            })
            req.on('end', () => {
                resolve(data)
            })
        })
    }

    getObject(data: any) {
        return new Promise((resolve, reject) => {
            parseString(data, (err, result) => {
                if (err)
                    reject(err)
                else resolve(result)
            })
        })
    }

    getLastData(query: any) {
        const obj: any = {}
        if (query && typeof query === 'object') {
            for (const key in query) {
                const value = query[key]
                if (value && value.length > 0)
                    obj[key] = value[0]
            }
            return obj
        }
        else {
            return obj
        }
    }
}