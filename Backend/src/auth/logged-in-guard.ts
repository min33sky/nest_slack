import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * 로그인 했는지 체크한다.
 */
@Injectable()
export class LoggedInGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(
      '######################### 로그인 검사 : ',
      request.isAuthenticated(),
    );
    return request.isAuthenticated();
  }
}
