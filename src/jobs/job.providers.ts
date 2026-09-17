import { Provider } from '@nestjs/common';
import { JOB_STORE, InMemoryJobStore, MongoJobStore } from './job.store';

export const jobStoreProvider: Provider = {
  provide: JOB_STORE,
  useClass: process.env.MONGODB_URI ? MongoJobStore : InMemoryJobStore,
};
