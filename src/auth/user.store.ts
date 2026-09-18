import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserEntity } from './user.entity';
import type { UserRecord } from './auth.types';

export const USER_STORE = Symbol('USER_STORE');

export interface UserStore {
  create(user: UserRecord): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | undefined>;
  findById(id: string): Promise<UserRecord | undefined>;
}

export class InMemoryUserStore implements UserStore {
  private readonly users = new Map<string, UserRecord>();

  async create(user: UserRecord): Promise<UserRecord> {
    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return [...this.users.values()].find((user) => user.email === email);
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    return this.users.get(id);
  }
}

export class MongoUserStore implements UserStore {
  constructor(@InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>) {}

  async create(user: UserRecord): Promise<UserRecord> {
    const document = await this.userModel.create(user);
    return this.toRecord(document);
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const document = await this.userModel.findOne({ email }).exec();
    return document ? this.toRecord(document) : undefined;
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    const document = await this.userModel.findOne({ id }).exec();
    return document ? this.toRecord(document) : undefined;
  }

  private toRecord(document: UserDocument): UserRecord {
    return {
      id: document.id,
      email: document.email,
      passwordHash: document.passwordHash,
      createdAt: document.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
