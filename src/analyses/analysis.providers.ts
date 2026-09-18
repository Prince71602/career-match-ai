import { Provider } from '@nestjs/common';
import { ANALYSIS_STORE, InMemoryAnalysisStore, MongoAnalysisStore } from './analysis.store';

export const analysisStoreProvider: Provider = {
  provide: ANALYSIS_STORE,
  useClass: process.env.MONGODB_URI ? MongoAnalysisStore : InMemoryAnalysisStore,
};
