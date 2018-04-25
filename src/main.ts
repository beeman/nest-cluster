import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as cluster from 'cluster';
import * as os from 'os';
import * as EventEmitter from 'events';
const clusterEmitter = new EventEmitter();

const numCPUs = os.cpus().length;
const minWorkers = numCPUs;
const workers = {};

const spawnWorker = () => {
  // Fork the process
  const worker = cluster.fork();
  // Store the ID in the map
  workers[worker.id] = worker;
};

clusterEmitter.on('spawnWorker', () => {
  spawnWorker();
});

const spawnWorkers = () => {
  while (Object.keys(workers).length < minWorkers) {
    clusterEmitter.emit('spawnWorker');
  }
};

if (cluster.isWorker) {
  async function bootstrap() {
    const app = await NestFactory.createMicroservice(AppModule);
    const id = cluster.worker.id;
    const timeOut = 1000 * 15 * id;

    console.log(`Worker ${id}: START ${process.pid} for ${timeOut} seconds`);

    setTimeout(() => {
      console.log(`Worker ${id}: DONE ${process.pid} after ${timeOut} seconds`);
      process.exit();
    }, timeOut);
    // await app.listen(process.env.PORT || 3000);
  }
  bootstrap();

} else {

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT || 3000);
    cluster.settings
    // app.clusterEmitter = clusterEmitter
  }

  bootstrap();
  spawnWorkers();
}

// Listen for dying workers
cluster.on('exit', (worker) => {
  console.log('exit', worker.id);
  delete workers[worker.id];
  spawnWorkers();
});
