import { Connection, Model, PaginateModel, PaginateOptions } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateCreatorDto, UpdateCreatorDto } from './app.dto';
import { Creator, CreatorModelInterface } from './app.schema';
import { addDays } from 'date-fns';
import { DeepRequired } from 'ts-essentials';
import { CREATOR_RESPONSE } from './app.response';
import { LogService, Logger } from '@core/logger';
import { PopulateOptions } from './common/helpers';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { APP_CONFIG } from './app.constants';
import { JobRequest, JobRequestModelInterface } from './jobs/request.schema';
import { AppPipeline } from './app.pipeline';
// import { CachingService } from '@libs/modules/caching';

@Injectable()
export class AppService {
  @Logger(AppService.name) private logger = new LogService();

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Creator.name) public readonly creatorModel: CreatorModelInterface,
    @InjectModel(Creator.name) public readonly creatorAdminModel: Model<Creator>,

    @Inject(APP_CONFIG.NOTIFICATION_SERVICE) private readonly notificationClient: ClientProxy,
    // private cache: CachingService,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(createCreatorDto: DeepRequired<CreateCreatorDto> & { userId: string }) {

    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const [creator] = await this.creatorModel.create([createCreatorDto], { session });

      await this.connection.db.collection('users').findOneAndUpdate({ userId: creator.userId }, {
        $set: {
          creatorId: creator.creatorId
        }
      }, { session });

      await session.commitTransaction();
      session.endSession();

      this.eventEmitter.emit(CREATOR_RESPONSE.LOG.CREATE, creator);

      return creator;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.log(error.message);
      if (error.message.includes('collection') || error.message.includes('iynfluencer')) throw error;

      throw new InternalServerErrorException('Error occured while trying to create a Creator Account! Try again later.');
    }

  }

  async getAll(query?: Record<string, any>, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    return await AppPipeline(this.creatorModel).getAll(rest, paginateOptions);
  }


  async getAdminAll(query?: Record<string, any>, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    const camp = await AppPipeline(this.creatorModel).getAll(rest, paginateOptions);
    const totalCamp = await this.creatorAdminModel.countDocuments()

    return {
      'paginatedCamp': camp,
      'totalAmount': totalCamp
    }
  }


  async getUserCamps(userid: string, populateOptions: PopulateOptions = []) {

    const query = {
      $or: [
        { userId: userid || '', suspended: false }
      ]
    };

    const creator = await AppPipeline(this.creatorModel).getAll(query, populateOptions);

    if (!creator) {
      throw new NotFoundException('Creator Not Found');
    }

    return creator;
  }


  async getOne(id: string, populateOptions: PopulateOptions = []) {

    const query = {
      $or: [
        { _id: id || '', suspended: false },
        { creatorId: id || '', suspended: false }
      ]
    };

    const creator = await AppPipeline(this.creatorModel).getOne(query, populateOptions);

    if (!creator) {
      throw new NotFoundException('Creator Not Found');
    }

    return creator;
  }



  async getByUser(userId: string, populateOptions: PopulateOptions = []) {
    const creator = await this.creatorModel.findOne({ userId }).populate(populateOptions);

    if (!creator) {
      throw new NotFoundException('Creator Not Found');
    }

    return creator;
  }

  async creatorExists(id: string) {

    if (!id) throw new ForbiddenException('Creator not found.')

    const creator = await this.creatorModel.findOne({
      $or: [
        { _id: id },
        { creatorId: id }
      ]
    })


    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  async getMe(id: string, populateOptions: PopulateOptions = []) {

    const creator = await this.creatorModel.findOne({
      $or: [
        { _id: id },
        { creatorId: id }
      ]
    }).populate(populateOptions);


    if (!creator) {
      throw new NotFoundException('Creator Not Found');
    }

    return creator;
  }

  async iamSuspended(creatorId: string, populateOptions: PopulateOptions = []) {
    const creator = await this.getMe(creatorId, populateOptions);

    if (creator.suspended) {
      throw new ForbiddenException('You have been suspended!');
    }

    return creator;
  }

  async update(id: string, updateCreatorDto: UpdateCreatorDto & { suspended?: boolean }) {
    const creator = await this.iamSuspended(id);

    return await this.creatorModel.findOneAndUpdate({ _id: creator._id }, { ...updateCreatorDto }, {
      new: true,
      runValidators: true
    })

  }

  remove(id: string) {

    return `This action removes a #${id} creator`;
  }
}
