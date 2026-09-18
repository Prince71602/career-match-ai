import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserEntity {
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, index: true })
  email!: string;

  @Prop({ type: String, required: true })
  passwordHash!: string;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;
}

export type UserDocument = HydratedDocument<UserEntity>;
export const UserSchema = SchemaFactory.createForClass(UserEntity);
