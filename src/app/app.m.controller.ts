import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { TAGS } from '@app/common/constants';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from '@core/logger';
import { MSController } from './common/helpers';

@ApiTags(TAGS.DEFAULT)
@Controller()
@MSController()
// @UsePipes(ZodValidationPipe)
export class AppMSController {

  private logger = new LogService();

  constructor(
    private readonly appService: AppService,
    ) {
    this.logger.setContext(AppMSController.name);
  }

  @MessagePattern({ cmd: 'SUSPENDED_CREATOR' })
  async suspendedInfluencer(@Payload() data: { creatorId: string},) {

    return await this.appService.iamSuspended(data.creatorId);
  }
}
