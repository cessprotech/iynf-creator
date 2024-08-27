import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, NotFoundException, Param, Patch, Post, Query, Req, UseFilters, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from '@core/common/interceptors/response';
import { HttpValidationFilter, MongooseExceptionFilter } from '@core/common/filters';
import { ApiTags } from '@nestjs/swagger';
import { TAGS } from '@app/common/constants';
import { LogService, Logger } from '@core/logger';
import { CREATOR_RESPONSE } from './app.response';
import { CreateCreatorDto, UpdateCreatorDto } from './app.dto';
import { DeepRequired } from 'ts-essentials';

import { Iam, Protect, Public } from '@core/auth/decorators';
import { APP_CONFIG } from './app.constants';
import { JOB_RESPONSE } from './jobs/job.response';
import { CreateJobDto, SendJobRequestDto, UpdateJobDto } from './jobs/job.dto';
import { JobService } from './jobs/job.service';
import { QueryOptions } from './common/helpers';
import { jobsRoute, hiredRoute } from './jobs/job.controller';

@Protect()
@ApiTags(`${TAGS.DEFAULT}/ME`)
@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@Controller(`me`)
// @UsePipes(ZodValidationPipe)
export class MeController {

  @Logger(MeController.name) private logger = new LogService();

  constructor(private readonly appService: AppService, private readonly jobService: JobService) {
  }
  @Post()
  @Response(CREATOR_RESPONSE.CREATE)
  createCreator(@Body() body: CreateCreatorDto, @Req() req) {
    let createCreatorDto = body as unknown as DeepRequired<CreateCreatorDto> & { userId: string };

    createCreatorDto.userId = req.user.userId;

    return this.appService.create(createCreatorDto);
  }

  @Get()
  @Iam()
  @Response(CREATOR_RESPONSE.FIND_ONE_BY_ID)
  getCreator(@Req() req) {
    return this.appService.getMe(req.user.creatorId);
  }

  @Patch()
  @Iam()
  @Response(CREATOR_RESPONSE.UPDATE)
  updateCreator(@Body() body: UpdateCreatorDto, @Req() req) {
    return this.appService.update(req.user.creatorId, body);
  }

  @Post(jobsRoute)
  @Iam()
  @Response(JOB_RESPONSE.CREATE)
  createJob(@Body() body: CreateJobDto, @Req() req) {
    let createJobDto = body as unknown as DeepRequired<CreateJobDto> & { creatorId: string };

    createJobDto.creatorId = req.user.creatorId;

    return this.jobService.create(createJobDto);
  }

  @Get(`${jobsRoute}`)
  @Iam()
  @Response(JOB_RESPONSE.FIND_ALL)
  async getMyJobs(@Query() query, @Req() req) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'bidsCount' },
      { path: 'review' },
      { path: 'creator' },
      { path: 'influencer', select: ['influencerId', 'userId'], populate: [{ path: 'user', select: ['firstName', 'lastName', 'avatar'] }] },
    ];

    return await this.jobService.getMyJobs(otherQuery, req.user.creatorId, paginateOptions);
  }

  @Get(`${jobsRoute}/:id/single`)
  @Iam()
  @Response(JOB_RESPONSE.FIND_ONE_BY_ID)
  getMyJob(@Param('id') id: string, @Req() req) {
    const populate = [
      { path: 'creator' },
      { path: 'influencer' },
      { path: 'bids' },
    ];
    return this.jobService.getMyJob(id, req.user.creatorId, populate);
  }

  @Patch(`${jobsRoute}/complete/:jobid`)
  @Iam()
  @Response(JOB_RESPONSE.UPDATE)
  markMyJobAsCompleted(@Param('jobid') jobid: string, @Req() req) {
    return this.jobService.markAsCompleted(jobid, req.user.creatorId);
  }

  @Patch(`${jobsRoute}/:id/single`)
  @Iam()
  @Response(JOB_RESPONSE.UPDATE)
  updateMyJob(@Param('id') id: string, @Body() body: UpdateJobDto, @Req() req) {
    return this.jobService.update(id, req.user.creatorId, body);
  }

  @Post(`jobs/request/send`)
  @Iam()
  @Response(JOB_RESPONSE.DEFAULT)
  sendJobRequest(@Body() body: SendJobRequestDto, @Req() req) {
    return this.jobService.sendJobRequest(body, { creatorId: req.user?.creatorId, influencerId: req.user?.influencerId, userId: req.user?.userId });

  }

  @Post(`${hiredRoute}/bid/:id`)
  @Iam()
  @Response(JOB_RESPONSE.DEFAULT)
  HireInfluencer(@Param('id') id: string, @Req() req) {
    return this.jobService.payInfluencer({ bidId: id }, req.user.creatorId);
  }

  @Get(hiredRoute)
  @Iam()
  @Response(JOB_RESPONSE.DEFAULT)
  async getMyHires(@Query() query, @Req() req) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      // { path: 'creator' },
      { path: 'influencer' },
      // { path: 'job' },
      { path: 'bid' },
    ];

    return await this.jobService.getMyHires(otherQuery, req.user.creatorId, paginateOptions);
  }

  @Get(`${hiredRoute}/:id/single`)
  @Iam()
  @Response(JOB_RESPONSE.DEFAULT)
  getMyHire(@Param('id') id: string, @Req() req) {
    const populate = [
      { path: 'creator' },
      { path: 'influencer' },
      { path: 'job' },
      { path: 'bid' },
    ];
    return this.jobService.getMyHire(id, req.user.creatorId, populate);
  }
}
