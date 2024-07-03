import { Prop, Schema } from '@nestjs/mongoose';
import { connection, Document, Types, model, Model, PaginateModel, PaginateOptions } from 'mongoose';

import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';
import { nanoid } from 'nanoid';

export enum JOBREQUEST_STATUS {
  PENDING = 'pending',
  BIDDED = 'bidded',
  DECLINED = 'declined',
}


interface JobRequestModelInterface extends Model<JobRequest>, PaginateModel<JobRequest> {
}

/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault())
export class JobRequest extends Document {
  @Prop({ default: () => nanoid(12), unique: true })
  readonly jobRequestId: string;

  @Prop({ required: [true, 'Job Id Is Required!'] })
  readonly jobId: string;
  
  @Prop({ required: [true, 'Creator Id Is Required!'] })
  readonly creatorId: string;

  @Prop({ required: [true, 'Influencer Id Is Required!'] })
  readonly influencerId: string;
  
  @Prop(
    { 
        enum: {
            values: Object.values(JOBREQUEST_STATUS),
            message: '{{VALUE}} must be either "pending" or "bidded" or "declined"'
        },
        default: JOBREQUEST_STATUS.PENDING,
        lowercase: true
    })
  readonly status: string;

  @Prop({ default: false })
  readonly declined: boolean;
}

const JobRequestModelName = JobRequest.name;
const JobRequestSchema = CREATE_SCHEMA<JobRequest>(JobRequest);


JobRequestSchema.index({ creatorId: 1});
JobRequestSchema.index({ influencerId: 1});
JobRequestSchema.index({ jobId: 1});

JobRequestSchema.virtual('influencer', {
  ref: "Influencer",
  localField: 'influencerId',
  foreignField: 'influencerId',
  justOne: true,
  options: {
    populate: [{ path: 'user' }]
  }
});

JobRequestSchema.virtual('creator', {
  ref: "Creator",
  localField: 'creatorId',
  foreignField: 'creatorId',
  justOne: true,
  options: {
    populate: [{ path: 'user' }]
  }
});

JobRequestSchema.virtual('job', {
  ref: "Job",
  localField: 'jobId',
  foreignField: 'jobId',
  justOne: true
});

JobRequestSchema.virtual('bid', {
  ref: "Bid",
  localField: 'bidId',
  foreignField: 'bidId',
  justOne: true
});


const JobRequestModel = { name: JobRequestModelName, schema: JobRequestSchema };

export { JobRequestSchema, JobRequestModelName, JobRequestModel, JobRequestModelInterface };

