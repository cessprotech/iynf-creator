import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LogService, Logger } from '@core/logger';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { APP_CONFIG } from '@app/app.constants';
import { MSResponse } from '@core/common/interfaces';
import { SendJobRequestDto } from '@app/jobs/job.dto';
// import { CachingService } from '@libs/modules/caching';

interface TransactionDto {
  creatorId: string,
  influencerId: string,
  jobId: string,
  bidId: string,
  amount: number,
}

@Injectable()
export class InfluencerMService {
  @Logger(InfluencerMService.name) private logger = new LogService();

  constructor(

    @Inject(APP_CONFIG.INFLUENCER_SERVICE) private readonly influencerClient: ClientProxy,

    @Inject(APP_CONFIG.PAYMENT_SERVICE) private readonly paymentClient: ClientProxy,

  ) { }

  async isSuspendedInfluencer(influencerId: string) {

    const response: MSResponse = await firstValueFrom(
      this.influencerClient.send({ cmd: 'SUSPENDED_INFLUENCER' }, { influencerId }),
    );

    if (!response.status) {
      throw new BadRequestException(response.error);
    }

    return response.data;
  }

  async acceptBid(bidId: string) {

    const response: MSResponse = await firstValueFrom(
      this.influencerClient.send({ cmd: 'ACCEPT_BID' }, { bidId }),
    );

    if (!response.status) {
      throw new BadRequestException(response.error);
    }

    return response.data;
  }

  async sendJobRequest(jobRequestDto: SendJobRequestDto & { creatorId: string, creatorUserId: string }) {

    const response: MSResponse = await firstValueFrom(
      this.influencerClient.send({ cmd: 'CREATE_JOB_REQUEST' }, { ...jobRequestDto }),
    );

    if (!response.status) {
      throw new BadRequestException(response.error);
    }

    return response.data;
  }

  async createTransaction(transactionDto: TransactionDto) {
    const response: MSResponse = await firstValueFrom(
      this.paymentClient.send({ cmd: 'PAY_BID' }, {
        creatorId: transactionDto.creatorId,
        influencerId: transactionDto.influencerId,
        jobId: transactionDto.jobId,
        bidId: transactionDto.bidId,
        amount: transactionDto.amount,
      }),
    );

    if (!response.status) throw new BadRequestException(response.error);

    return response.data;
  }

}
