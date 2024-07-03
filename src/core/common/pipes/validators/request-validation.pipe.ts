import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Logger, LogService } from '@core/logger';
import {
  Message,
  E_RESPONSE,
  MessageService,
  IErrors,
} from '@core/modules/message';
import { plainToClassFromExist } from 'class-transformer';

export class RequestValidationPipe implements PipeTransform {

  @Message() private readonly messageService: MessageService = new MessageService();
    @Logger(RequestValidationPipe.name) private readonly logger: LogService = new LogService()
  constructor(
  ) {}

  async transform(
    value: Record<string, any>,
    { metatype }: ArgumentMetadata,
  ): Promise<Record<string, any>> {
    // if (!metatype || !this.toValidate(metatype)) {
    //   return value;
    // }

    const request = plainToClassFromExist(metatype, value);
    this.logger.log({
      class: RequestValidationPipe.name,
      function: 'transform',
      request: request,
    });

    console.log(request);

    const rawErrors: Record<string, any>[] = await validate(request, { forbidUnknownValues: true, forbidNonWhitelisted: true });
    if (rawErrors.length > 0) {
      const errors: IErrors[] =
        this.messageService.getRequestErrorsMessage(rawErrors);

      this.logger.error('Request Errors', {
        class: RequestValidationPipe.name,
        function: 'transform',
        errors,
      });

      throw new BadRequestException(
        errors,
        this.messageService.get(E_RESPONSE.HTTP.CLIENT_ERROR.BAD_REQUEST),
      );
    }
    return value;
  }

  private toValidate(metatype: Record<string, any>): boolean {
    const types: Record<string, any>[] = [];
    return types.includes(metatype);
  }
}
