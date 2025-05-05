import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error-handler';
import pluginRoutes from './routes/plugin-routes';
import actionRoutes from './routes/action-routes';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.express.use(cors());
    this.express.use(helmet());
    this.express.use(express.json());
  }

  private initializeRoutes() {
    this.express.use('/plugins', pluginRoutes);
    this.express.use('/actions', actionRoutes);
  }

  private initializeErrorHandling() {
    this.express.use(errorHandler);
  }

  public listen(port: number) {
    this.express.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

export default new App();