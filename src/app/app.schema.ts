import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types, model, Model, PaginateModel } from 'mongoose';
import { NextFunction } from 'express';

import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';
import { nanoid } from 'nanoid';


interface CreatorModelInterface extends Model<Creator>, PaginateModel<Creator> {
}

/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault([]))
export class Creator extends Document {

  @Prop({ default: () => nanoid(12), unique: true })
  readonly creatorId: string;

  @Prop({ required: [true, 'User Is Required!'], unique: true })
  readonly userId: string;

  @Prop({ required: [true, 'Niche Is Required!'] })
  readonly niche: string[];

  @Prop({ required: [true, 'Bio Is Required!'] })
  readonly bio: string;
  
  @Prop({
    default: true
  })
  readonly completed: boolean;
  
  @Prop({
    default: false
  })
  readonly suspended: boolean;
}

const CreatorModelName = Creator.name;
const CreatorSchema = CREATE_SCHEMA<Creator>(Creator);

CreatorSchema.index({ userId: 1, title: 1 }, { unique: true });

CreatorSchema.virtual('user', {
  ref: "User",
  localField: 'userId',
  foreignField: 'userId',
  justOne: true
});


CreatorSchema.pre('save', async function (next: NextFunction) {
  if (this.isNew) {}

  next();
});

CreatorSchema.pre(/update|updateOne|findOneAndUpdate|findByIdAndUpdate/, async function () {

  const creator: any = this

  const query = creator._conditions;

  const updateFields = creator._update;

});


const CreatorModel = { name: CreatorModelName, schema: CreatorSchema };

export { CreatorSchema, CreatorModelName, CreatorModel, CreatorModelInterface };

