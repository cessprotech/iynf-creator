import { applyDecorators, SetMetadata, UseGuards, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticationGuard } from '../authentication.guard';

export const PUBLIC_KEY = 'IS_PUBLIC';
export const IAM = 'CREATOR';
export const INFLUENCER = 'INFLUENCER';



// eslint-disable-next-line @typescript-eslint/ban-types

export const Protect = () => {
  return applyDecorators(
    UseGuards(AuthenticationGuard),
  );
};

export const Public = () => SetMetadata(PUBLIC_KEY, true);
export const Iam = () => SetMetadata(IAM, true);
export const Influencer = () => SetMetadata(INFLUENCER, true);

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    return user || null;
  },
);
