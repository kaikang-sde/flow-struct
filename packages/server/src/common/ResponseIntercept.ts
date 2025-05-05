import type {
    ExecutionContext,
    NestInterceptor,
    CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { Injectable } from '@nestjs/common';


@Injectable()
export class ResponseIntercept implements NestInterceptor {
    // invoke next handler, and use pipe and map to process data
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (data?.msg === 'wechat validation callback') return data.data
                return {
                    code: 0,
                    data,
                };
            }),
        );
    }
}
