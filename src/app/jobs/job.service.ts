import { Connection, Model, PaginateModel, PaginateOptions } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateJobDto, HiredDto, SendJobRequestDto, UpdateJobDto } from './job.dto';
import { Job, JobModelInterface } from './job.schema';
import { addDays } from 'date-fns';
import { DeepRequired } from 'ts-essentials';
import { JOB_RESPONSE } from './job.response';
import { LogService, Logger } from '@core/logger';
import { CustomPopulateOptions, PopulateOptions } from '@app/common/helpers';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { APP_CONFIG } from '@app/app.constants';
import { AppService } from '@app/app.service';
import { Hired, HiredModelInterface } from './hired.schema';
import { InfluencerMService } from '@app/mservices/influencer.m.service';
import { JOBREQUEST_STATUS, JobRequest, JobRequestModelInterface } from './request.schema';
import { AppPipeline } from '@app/app.pipeline';
// import { CachingService } from '@libs/modules/caching';

@Injectable()
export class JobService {
  @Logger(JobService.name) private logger = new LogService();

  constructor(
    @InjectConnection() private readonly connection: Connection,

    @InjectModel(Job.name) public readonly jobModel: JobModelInterface,

    @InjectModel(Hired.name) public readonly hiredModel: HiredModelInterface,

    @InjectModel(JobRequest.name) public readonly jobRequestModel: JobRequestModelInterface,

    private readonly influencerMService: InfluencerMService,

    // private cache: CachingService,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(createJobDto: DeepRequired<CreateJobDto> & { creatorId: string }) {

    const job = await this.jobModel.create({ ...createJobDto });

    this.eventEmitter.emit(JOB_RESPONSE.LOG.CREATE, job);

    return job;
  }

  async getAllWithoutBids(query: Record<string, any> = {}, influencerId: string, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    return await this.jobModel.paginate({ ...rest, suspended: false, hired: false }, paginateOptions);

    // return await this.jobModel.getJobsWithoutBids({...rest, suspended: false, hired: false }, influencerId, paginateOptions);
  }

  async getAll(query: Record<string, any> = {}, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    return await this.jobModel.paginate({ ...rest, suspended: false, hired: false }, paginateOptions);
  }

  async getAllWithAggregate(query: Record<string, any> = {}, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    // return await AppPipeline(this.jobModel).getAll(rest, paginateOptions);
    return await this.jobModel.paginate({ ...rest }, paginateOptions);
  }

  async getMyJobs(query: Record<string, any> = {}, creatorId: string, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    // return await this.jobModel.paginate({ ...rest, creatorId }, paginateOptions);
    
    return await AppPipeline(this.jobModel).getAll({ ...rest, creatorId }, paginateOptions);
  }


  async getOne(id: string, populateOptions: PopulateOptions = []) {
    const job = await this.jobModel.findOne({
      $or: [
        { _id: id || '' },
        { jobId: id || '' }
      ]
    }).populate(populateOptions);

    if (!job) {
      throw new NotFoundException('Job Not Found');
    }

    return job;
  }

  async getOneWithAggregate(id: string, populateOptions: CustomPopulateOptions[] = []) {

    const query = {
      $or: [
        { _id: id || '' },
        { jobId: id || '' }
      ]
    };

    const job = await AppPipeline(this.jobModel).getOne(query, populateOptions);

    if (!job) {
      throw new NotFoundException('Job Not Found');
    }

    return job;
  }

  async getMyJob(id: string, creatorId: string, populateOptions: PopulateOptions = []) {
    const job = await this.jobModel.findOne({
      $or: [
        { _id: id || '', creatorId },
        { jobId: id || '', creatorId }
      ]
    }).populate(populateOptions);

    if (!job) {
      throw new NotFoundException('Job Not Found');
    }

    return job;
  }

  async jobSuspendedOrNotFoundOrHired(id: string, creatorId?: string, populateOptions: PopulateOptions = []) {
    let query: Record<string, any>[] = [
      { _id: id || '' },
      { jobId: id || '' }
    ];

    if (creatorId) query = [
      { _id: id || '', creatorId },
      { jobId: id || '', creatorId }
    ]

    const job = await this.jobModel.findOne({ $or: query }).populate(populateOptions);

    if (!job) {
      throw new NotFoundException('Job Not Found');
    }

    if (job.suspended) {
      throw new ForbiddenException('You cannot perform this operation. This Job has been suspended!');
    }

    if (job.hired) {
      throw new ForbiddenException('You cannot perform this operation. This Job has been taken!');
    }

    return job;
  }

  async update(id: string, creatorId: string, updateJobDto: UpdateJobDto & { suspended?: boolean }) {
    const job = await this.jobSuspendedOrNotFoundOrHired(id, creatorId);

    return await this.jobModel.findOneAndUpdate({ jobId: job.jobId }, { ...updateJobDto }, {
      new: true,
      runValidators: true
    })

  }

  async markAsCompleted(jobid: string, creatorId: string) {

    const job = await this.jobModel.findOne({ jobId: jobid, creatorId: creatorId })

    if (!job) {
      throw new NotFoundException('Job Not Found');
    }

    if (job.status == 'Completed') {
      throw new NotFoundException('job already completed');
    }

    let complete = await this.jobModel.findOneAndUpdate(
      { jobId: jobid },
      { $set: { status: 'Completed' } },
      {
        new: true,
        runValidators: true
      }
    )

    const hired = await this.hiredModel.findOne({ jobId: job.jobId, })

    await this.influencerMService.markComplete({
      influencerId: hired.influencerId,
      amount: hired.price
    });

    return complete

  }

  async delete(id: string, creatorId: string) {

    const job = await this.jobSuspendedOrNotFoundOrHired(id, creatorId);

    return await this.jobModel.findOneAndDelete({ jobId: job.jobId });
  }

  //SEND REQUEST
  async sendJobRequest(query: { jobId: string, influencerId: string }, user: { creatorId: string, influencerId: string, userId: string }) {

    const { creatorId, influencerId } = user;

    if (influencerId === query.influencerId) throw new ForbiddenException('You cannot perform this operation. You cannot send a job request to yourself.');

    const job = await this.jobSuspendedOrNotFoundOrHired(query.jobId, creatorId);


    const data = await this.influencerMService.sendJobRequest({
      jobId: job.jobId,
      creatorId: creatorId,
      creatorUserId: user.userId,
      influencerId: query.influencerId
    });

    return data;
  }

  // HIRED METHODS
  async payInfluencer(query: HiredDto, creatorId: string) {
    const data = await this.influencerMService.acceptBid(query.bidId);

    const job = await this.jobSuspendedOrNotFoundOrHired(data.jobId, creatorId);

    const session = await this.connection.startSession();

    session.startTransaction();

    try {

      const transaction = await this.influencerMService.createTransaction({
        creatorId,
        influencerId: data.influencerId,
        jobId: data.jobId,
        bidId: data.bidId,
        amount: data.price
      })


      const [hired] = await this.hiredModel.create([{
        jobId: job.jobId,
        creatorId: job.creatorId,
        influencerId: data.influencerId,
        bidId: data.bidId,
        price: data.price,
        deadline: job.duration,
      }], {
        session
      });

      // set hired to true
      await this.jobModel.findOneAndUpdate({ jobId: job.jobId }, {
        $set: {
          hired: true,
          hiredId: hired.hiredId,
          influencerId: hired.influencerId,
          status: 'In Progress',
          amount: data.price
        }
      }, { new: true, runValidators: true, session });


      await this.connection.db.collection('bids').updateMany({ jobId: hired.jobId }, {
        $set: {
          hired: false,
          status: 'declined'
        }
      }, { session });

      await this.connection.db.collection('bids').findOneAndUpdate({ bidId: hired.bidId }, {
        $set: {
          hired: true,
          hiredId: hired.hiredId,
          status: 'accepted',
          paymentStatus: true
        }
      }, { session });



      await session.commitTransaction();
      session.endSession();

      return transaction;
      // return {
      //   status: true,
      //   data: transaction,
      //   error: null
      // }


    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.log(error.message);
      this.logger.error(error.message, error.stack);

      throw new InternalServerErrorException(error.message);
      // if (error.message.includes('collection') || error.message.includes('iynfluencer')) return {
      //   status: false,
      //   data: null,
      //   error: error.message
      // };

      // return {
      //   status: false,
      //   data: null,
      //   error: 'Error occured while trying to hire this influencer! Try again later.'
      // }
    }
  }

  async hireAnInfluencer(query: HiredDto, creatorId: string) {
    const data = await this.influencerMService.acceptBid(query.bidId);

    const job = await this.jobSuspendedOrNotFoundOrHired(data.jobId, creatorId);

    const session = await this.connection.startSession();

    session.startTransaction();

    try {

      const [hired] = await this.hiredModel.create([{
        jobId: job.jobId,
        creatorId: job.creatorId,
        influencerId: data.influencerId,
        bidId: data.bidId,
        price: data.price,
        deadline: job.duration,
      }], {
        session
      });

      await this.jobModel.findOneAndUpdate({ jobId: job.jobId }, {
        $set: {
          hired: true,
          hiredId: hired.hiredId,
          influencerId: hired.influencerId
        }
      }, { new: true, runValidators: true, session });


      await this.connection.db.collection('bids').updateMany({ jobId: hired.jobId }, {
        $set: {
          hired: false,
          status: 'declined'
        }
      }, { session });

      await this.connection.db.collection('bids').findOneAndUpdate({ bidId: hired.bidId }, {
        $set: {
          hired: true,
          hiredId: hired.hiredId,
          status: 'accepted'
        }
      }, { session });

      await session.commitTransaction();
      session.endSession();

      return hired;
      // return {
      //   status: true,
      //   data: hired,
      //   error: null
      // }


    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.log(error.message);
      this.logger.error(error.message, error.stack);

      throw new InternalServerErrorException(error.message);
      // if (error.message.includes('collection') || error.message.includes('iynfluencer')) return {
      //   status: false,
      //   data: null,
      //   error: error.message
      // };

      // return {
      //   status: false,
      //   data: null,
      //   error: 'Error occured while trying to hire this influencer! Try again later.'
      // }
    }
  }

  async getMyHires(query: Record<string, any> = {}, creatorId: string, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    return await this.hiredModel.paginate({ ...rest, creatorId }, paginateOptions);
  }

  async getMyHire(id: string, creatorId: string, populateOptions: PopulateOptions = []) {
    const hired = await this.hiredModel.findOne({
      $or: [
        { _id: id || '', creatorId },
        { hiredId: id || '', creatorId }
      ]
    }).populate(populateOptions);

    if (!hired) {
      throw new NotFoundException('Job Not Found');
    }

    return hired;
  }

}
