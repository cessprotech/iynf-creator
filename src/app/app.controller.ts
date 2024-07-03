import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UseFilters, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from '@core/common/interceptors/response';
import { E_RESPONSE } from '@core/modules/message';
import { HttpValidationFilter, MongooseExceptionFilter } from '@core/common/filters';
import { ApiTags } from '@nestjs/swagger';
import { TAGS } from '@app/common/constants';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { LogService, Logger } from '@core/logger';
import { CREATOR_RESPONSE } from './app.response';
import { QueryOptions } from './common/helpers';
import { Protect, Public } from '@core/auth/decorators';
import { jobsRoute } from './jobs/job.controller';
import { JobService } from './jobs/job.service';
import { JOB_RESPONSE } from './jobs/job.response';


// @Protect()
@ApiTags(TAGS.DEFAULT)
@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@Controller()
// @UsePipes(ZodValidationPipe)
export class AppController {

  @Logger(AppController.name) private logger = new LogService();

  constructor(
    private readonly appService: AppService,
    private readonly jobService: JobService,
  ) {
  }

  @Public()
  @Get()
  @Response(CREATOR_RESPONSE.FIND_ALL)
  async getAll(@Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'user' },
    ];

    if (Array.isArray(otherQuery.niche) && otherQuery.niche.length > 0) {
      otherQuery.niche = { $in: otherQuery.niche };
    }

    return await this.appService.getAll(otherQuery, paginateOptions);
  }

  // @Public()
  @Get('admin/campaign')
  @Response(CREATOR_RESPONSE.FIND_ALL)
  async getAdminAll(@Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'user' },
    ];

    if (Array.isArray(otherQuery.niche) && otherQuery.niche.length > 0) {
      otherQuery.niche = { $in: otherQuery.niche };
    }

    return await this.appService.getAdminAll(otherQuery, paginateOptions);
  }

  // @Public()
  @Get('admin/campaign/user/:userid/')
  @Response(CREATOR_RESPONSE.FIND_ONE_BY_ID)
  getUserCampaigns(@Param('userid') userid: string) {
    const populate = [
      { path: 'user' },
    ];
    return this.appService.getUserCamps(userid, populate);
  }


  @Get('admin/transaction/:id')
  // @CacheData('FIND_ALL')
  @Response(CREATOR_RESPONSE.FIND_ALL)
  async getTransaction(@Param('id') creatorId: string, @Query() query) {
      const { otherQuery, paginateOptions } = QueryOptions(query, true);

      // paginateOptions.populate = [
      //     // { path: 'creator' },
      //     { path: 'influencer' },
      //     // { path: 'job' },
      //     { path: 'bid' },
      //   ];
      
      return await this.jobService.getMyHires(otherQuery, creatorId, paginateOptions);
  }


  @Public()
  @Get(':_id/single')
  @Response(CREATOR_RESPONSE.FIND_ONE_BY_ID)
  getCreator(@Param('_id') id: string) {
    const populate = [
      { path: 'user' },
    ];
    return this.appService.getOne(id, populate);
  }
}
