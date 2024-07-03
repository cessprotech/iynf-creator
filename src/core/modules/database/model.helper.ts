import { MongooseModule } from '@nestjs/mongoose';
import { AnyARecord } from 'dns';
import { Schema, Document } from 'mongoose';

export interface IModel {
  name: string;

  schema: Schema<any & Document>;
}

/**
 * @description module to create mongoose model to be imported in feature module
 *
 * @exports MongooseModule_ForFeature
 *
 * @params options[]
 */
export const MODEL_INJECT = (options: IModel[]) =>
  MongooseModule.forFeature(options);