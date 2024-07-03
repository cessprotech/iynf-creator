import { Schema, Document } from 'mongoose';

/**
 * @interface
 *
 * @description nestjs mongoose forFeature model creation interface
 */
export interface IModel {
  name: string;

  schema: Schema<Document>;
}
