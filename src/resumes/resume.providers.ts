import { Provider } from '@nestjs/common';
import { RESUME_STORE, InMemoryResumeStore, MongoResumeStore } from './resume.store';

export const resumeStoreProvider: Provider = {
  provide: RESUME_STORE,
  useClass: process.env.MONGODB_URI ? MongoResumeStore : InMemoryResumeStore,
};
