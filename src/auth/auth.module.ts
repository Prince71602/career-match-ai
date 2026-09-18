import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserEntity, UserSchema } from './user.entity';
import { MongoUserStore, InMemoryUserStore, USER_STORE } from './user.store';

const userStoreProvider = {
  provide: USER_STORE,
  useClass: process.env.MONGODB_URI ? MongoUserStore : InMemoryUserStore,
};

@Module({
  imports: process.env.MONGODB_URI ? [MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }])] : [],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, userStoreProvider],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
