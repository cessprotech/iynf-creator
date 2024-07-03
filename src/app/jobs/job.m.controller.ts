import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UseFilters } from '@nestjs/common';
import { JobService } from './job.service';
import { ApiTags } from '@nestjs/swagger';
import { TAGS } from '@app/common/constants';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { LogService } from '@core/logger';
import { MSController } from '@app/common/helpers';


@ApiTags(TAGS.JOBS)
@Controller()
@MSController()
// @UsePipes(ZodValidationPipe)
export class JobMController {

  private logger = new LogService();

  constructor(private readonly jobService: JobService) {
    this.logger.setContext(JobMController.name);
  }

  @MessagePattern({ cmd: 'GET_JOB' })
  async validJob(@Payload() data: { jobId: string }) {

    return await this.jobService.jobSuspendedOrNotFoundOrHired(data.jobId);
  }

  @MessagePattern({ cmd: 'HIRE_INFLUENCER' })
  async hireInfluencer(@Payload() data: { bidId: string, creatorId: string }) {

    return await this.jobService.hireAnInfluencer({ bidId: data.bidId }, data.creatorId);
  }
}
