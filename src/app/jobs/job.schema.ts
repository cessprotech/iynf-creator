import { Prop, Schema } from '@nestjs/mongoose';
import { connection, Document, Types, model, Model, PaginateModel, PaginateOptions, PipelineStage } from 'mongoose';

import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';
import { nanoid } from 'nanoid';


interface JobModelInterface extends Model<Job>, PaginateModel<Job> {
  getJobsWithoutBids(query: { [x: string]: unknown }, influencerId: string, paginateOptions: PaginateOptions): Promise<Job[]>;
}

/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault())
export class Job extends Document {
  @Prop({ default: () => nanoid(12), unique: true })
  readonly jobId: string;
  
  @Prop({ required: [true, 'Creator Id Is Required!'] })
  readonly creatorId: string;
  
  @Prop({ required: [true, 'Title Is Required!'] })
  readonly title: string;
  
  @Prop({ required: [true, 'Description Is Required!'] })
  readonly description: string;

  @Prop({ required: [true, 'Responsibilities Is Required!'] })
  readonly responsibilities: string[];

  @Prop({})
  readonly media: string;

  @Prop({ required: [true, 'Category Is Required!'] })
  readonly category: string[];

  @Prop({ required: [true, 'Budget From Is Required!'] })
  budgetFrom: number;
  
  @Prop({ required: [true, 'Budget To Is Required!'] })
  budgetTo: number;
  
  @Prop({ required: [true, 'Duration Is Required!'] })
  duration: number;

  @Prop({
    default: true
  })
  readonly public: boolean;
  
  @Prop({
    default: false
  })
  readonly hired: boolean;
  
  @Prop({ required: [function () {
    return this.hired;
  }, 'Influencer Id is required.'] })
  readonly influencerId: string;
  
  @Prop({ required: [function () {
    return this.hired;
  }, 'Hired Id is required.'] })
  readonly hiredId: string;
  
  @Prop({
    default: false
  })
  readonly suspended: boolean;
  
  @Prop({
    default: 'available'
  })
  status: string;
}

const JobModelName = Job.name;
const JobSchema = CREATE_SCHEMA<Job>(Job);

JobSchema.index({ creatorId: 1 });
JobSchema.index({ jobId: 1 });

JobSchema.virtual('influencer', {
  ref: "Influencer",
  localField: 'influencerId',
  foreignField: 'influencerId',
  justOne: true,
  options: {
    populate: [{ path: 'user' }]
  }
});

JobSchema.virtual('creator', {
  ref: "Creator",
  localField: 'creatorId',
  foreignField: 'creatorId',
  justOne: true,
  options: {
    populate: [{ path: 'user' }]
  }
});

JobSchema.virtual('bids', {
  ref: "Bid",
  localField: 'jobId',
  foreignField: 'jobId',
});

JobSchema.virtual('bidsCount', {
  ref: "Bid",
  localField: 'jobId',
  foreignField: 'jobId',
  match: { suspended: false },
  count: true
});

JobSchema.virtual('review', {
  ref: "Review",
  localField: 'jobId',
  foreignField: 'jobId'
});

JobSchema.statics.getJobsWithoutBids = async function (query: {
  [x: string]: unknown
}, influencerId: string, paginateOptions: PaginateOptions = {}) {

  let pipeline: PipelineStage[] = [
    {
      $match: { ...query }
    },
    {
      $lookup: {
        from: 'bids',
        let: { jobId: '$jobId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$jobId', '$$jobId'] },
                  { $eq: ['$influencerId', influencerId] },
                ],
              },
            },
          },
        ],
        as: 'bids',
      },
    },
    {
      $match: {
        bids: { $size: 0 },
      },
    },
    {
      $lookup: {
        from: 'creators',
        localField: 'creatorId',
        foreignField: '_id',
        as: 'creator',
      },
    },
    {
      $unwind: '$creator',
    },
    {
      $sort: { "createdAt": 1 }
    },
    {
      $project: {
        bids: 0
      }
    }
  ];
  
  // if (!influencerId) {
  //   // Remove the $lookup stage for likes if userId is undefined
  //   pipeline = pipeline.filter(stage => !stage["$lookup"] || stage["$lookup"].from !== "content_likes");
  // }
  

  const jobs = await this.aggregate(pipeline);

  const countPipeline: PipelineStage[] = [{ $match: { ...query } }];
  const totalCount = await this.aggregate(countPipeline).count("count").exec();
  const totalJobs = totalCount.length > 0 ? totalCount[0].count : 0;

  return {
    docs: jobs,
    totalDocs: totalJobs,
    limit: paginateOptions.limit,
    totalPages: Math.ceil(totalJobs / paginateOptions.limit),
    page: paginateOptions.page,
    pagingCounter: (paginateOptions.page - 1) * paginateOptions.limit + 1,
    hasPrevPage: paginateOptions.page > 1,
    hasNextPage: paginateOptions.page < Math.ceil(totalJobs / paginateOptions.limit),
    prevPage: paginateOptions.page > 1 ? paginateOptions.page - 1 : null,
    nextPage: paginateOptions.page < Math.ceil(totalJobs / paginateOptions.limit) ? paginateOptions.page + 1 : null
  };

}


const JobModel = { name: JobModelName, schema: JobSchema };

export { JobSchema, JobModelName, JobModel, JobModelInterface };

