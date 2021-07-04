import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class UndefinedToNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    //! 컨트롤러 실행 전에 호출되는 코드를 작성하는 부분. pipe() 함수는 컨트롤러 실행 후에 호출되는 부분
    console.log('Before.........(intercepter)');
    const now = Date.now();
    return next.handle().pipe(
      map((data) => (data === undefined ? null : data)),
      tap(() =>
        console.log(`After........(intercepter) ${Date.now() - now}ms`),
      ),
      tap((data) => console.log(`data: ${data}, ${typeof data}`)),
    );
  }
}
