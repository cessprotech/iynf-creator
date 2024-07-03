import { Document } from 'mongoose';

/**
 * @interface
 *
 * @description default mongoose schema interface
 *
 * @extends MongooseDocumentInterface
 */
export interface ISchema<T> {
  new (): T & Document;
}
