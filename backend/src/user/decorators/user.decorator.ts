import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserReq = createParamDecorator(
  (data: { param: string }, ctx: ExecutionContext) => {
    if (!data?.param) {
      return ctx.switchToHttp().getRequest().user;
    }
    const request = ctx.switchToHttp().getRequest();
    let param = request?.params[data?.param];

    if (data?.param === 'username') {
      // console.log('username check for :', request.url);
      // console.log(
      //   'param username :',
      //   param,
      //   'request user :',
      //   request.user.username,
      // );
      if (param !== request.user.username) {
        console.log('username not match for endpoint :', request.url);
        throw new Error(
          `Unauthorized because username ${param} not match with request user ${request.user.username}`,
        );
      }
    }
    if (data?.param === 'id') {
      param = parseInt(param);
      // console.log('id check for :', request.url);
      // console.log('id', param, 'request user :', request.user.id);
      if (param !== request.user.id) {
        console.log('id not match for endpoint :', request.url);
        throw new Error(
          `Unauthorized because id ${param} not match with request user ${request.user.id}`,
        );
      }
    }
    return request.user;
  },
);
