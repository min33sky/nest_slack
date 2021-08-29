import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User Decorator
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // console.log('[User Decorator] request.user: ', request.user);
    const user = request.user;

    //? 받은 인자값이 있다면 객체의 키로 사용하여 리턴
    return data ? user?.[data] : user;
  },
);
