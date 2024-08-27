import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, NotFoundException, Param, Patch, Post, Query, Req, UseFilters, UsePipes } from '@nestjs/common';
import { JobService } from './job.service';
import { Response } from '@core/common/interceptors/response';
import { HttpValidationFilter, MongooseExceptionFilter } from '@core/common/filters';
import { ApiTags } from '@nestjs/swagger';
import { TAGS } from '@app/common/constants';
import { LogService, Logger } from '@core/logger';
import { JOB_RESPONSE } from './job.response';
import { DeepRequired } from 'ts-essentials';

import { Protect, Public } from '@core/auth/decorators';
import { QueryOptions } from '@app/common/helpers';

export const jobsRoute = TAGS.JOBS.toLowerCase();
export const hiredRoute = TAGS.HIRED.toLowerCase();

@Protect()
@ApiTags(`${TAGS.JOBS}`)
@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@Controller(`${jobsRoute}`)
// @UsePipes(ZodValidationPipe)
export class JobController {

  @Logger(JobController.name) private logger = new LogService();

  constructor(private readonly jobService: JobService) {
  }

  @Get()
  @Response(JOB_RESPONSE.FIND_ALL)
  async getJobs(@Query() query, @Req() req) {

    const influencerId = req.user.influencerId;

    if (!influencerId) throw new ForbiddenException('You must be an influencer to view.')

    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'creator', select: ['creatorId', 'userId'], populate: [{ path: 'user', select: ['firstName', 'lastName', 'avatar', 'country'], unwindType: 1 }], unwindType: 1 },
      { path: 'bidsCount' },
      { path: 'bids' },
    ];

    otherQuery.influencerId = { $exists: false };
    otherQuery.hired = false;

    return await this.jobService.getAllWithAggregate(otherQuery, paginateOptions);
  }

  @Get(`influencer`)
  async getInfluencerJobs(@Query() query, @Req() req) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    if (!(req.user.influencerId)) throw new ForbiddenException('You must be an influencer to view.')

    otherQuery.influencerId = req.user.influencerId;

    paginateOptions.populate = [
      { path: 'creator', select: ['creatorId', 'userId'], populate: [{ path: 'user', select: ['firstName', 'lastName', 'avatar', 'country'], unwindType: 1 }], unwindType: 1 },
      { path: 'review' },
    ];

    return await this.jobService.getAllWithAggregate(otherQuery, paginateOptions);
  }

  @Get(`:id/single`)
  @Response(JOB_RESPONSE.FIND_ONE_BY_ID)
  getJob(@Param('id') id: string, @Req() req) {
    const populate = [
      { path: 'creator', select: ['creatorId', 'userId'], populate: [{ path: 'user', select: ['firstName', 'lastName', 'avatar', 'country'], unwindType: 1 }], unwindType: 1 },
      { path: 'bidsCount' },
    ];

    return this.jobService.getOneWithAggregate(id, populate);
  }

  @Get(`all`)
  @Response(JOB_RESPONSE.UPDATE)
  async getAllJobs(@Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'creator' },
      // { path: 'influencer' },
    ];

    return await this.jobService.getAll(otherQuery, paginateOptions);
  }
}
