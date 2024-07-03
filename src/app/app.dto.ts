import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';
import { ZodRequired } from './common/helpers';

const CreateCreator = extendApi(
  z.object({
    bio: z.string().min(100),
    niche: z.array(z.string()).min(1),
  }),
  {
    title: 'Creator Data',
    description: 'Creator Data'
  }
);

export class CreateCreatorDto extends createZodDto(CreateCreator.strict()){};

// export type CreateCreatorDto = DeepRequired<CreateCreatorDtoClass>

export class UpdateCreatorDto extends createZodDto(CreateCreator.deepPartial()) {}

const UploadBannerUrl = extendApi(
  z.object({
    title: z.string().min(1),
    contentType: z.string().min(1),
  }),
  {
    title: 'Content Upload Data',
    description: 'Content Upload Data'
  }
);

export class UploadBannerUrlDto extends createZodDto(UploadBannerUrl.strict()){};





