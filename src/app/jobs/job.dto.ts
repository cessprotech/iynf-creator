import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { ZodRequired } from '@app/common/helpers';
import { z } from 'zod';

const CreateJob = extendApi(
  z.object({
    title: z.string().min(3),
    media: z.string().min(1).optional(),
    category: z.array(z.string().min(1)).optional(),
    responsibilities: z.array(z.string().min(1)),
    budgetFrom: z.number().min(0),
    budgetTo: z.number().min(0),
    description: z.string().min(10),
    duration: z.number().min(1),
  }),
  {
    title: 'Create Job',
    description: 'Create Job'
  }
);

const Hired = extendApi(
  z.object({
    bidId: z.string().min(1),
  }),
  {
    title: 'Hire An Influencer',
    description: 'Hire An Influencer'
  }
);

const SendJobRequest = extendApi(
  z.object({
    jobId: z.string().min(1),
    influencerId: z.string().min(1),
  }),
  {
    title: 'Send Request To An Influencer',
    description: 'Send Request To An Influencer'
  }
);

// const SaveContent = extendApi(
//   z.object({
//     title: z.string().min(3),
//     description: z.string().min(10),
//     url: z.string().min(1),
//     cover: z.string().min(1).optional(),
//   }),
//   {
//     title: 'Job Save Content',
//     description: 'Job Save Content'
//   }
// );

const UploadContentUrl = extendApi(
  z.object({
    contentType: z.string().min(1),
  }),
  {
    title: 'Content Upload Data',
    description: 'Content Upload Data'
  }
);

export class HiredDto extends (createZodDto(Hired) as ZodRequired<typeof Hired>) { }

export class SendJobRequestDto extends (createZodDto(SendJobRequest) as ZodRequired<typeof SendJobRequest>) { }

export class CreateJobDto extends createZodDto(CreateJob.strict()) { };

export class UpdateJobDto extends createZodDto(CreateJob.deepPartial()) { }

// export class SaveContentDto extends createZodDto(SaveContent.strict()){};
export class UploadContentUrlDto extends createZodDto(UploadContentUrl.strict()) { };






