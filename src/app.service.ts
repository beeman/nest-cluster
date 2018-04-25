import { Injectable } from '@nestjs/common';
import * as cluster from 'cluster';

const formatWorker = worker => {
  const { id, state, process } = worker;
  const { pid, connected } = process;
  return {
    id,
    pid,
    state,
    connected,
  };
};

@Injectable()
export class AppService {

  root(): any {
    const workers = Object.keys(cluster.workers)
      .map(id => cluster.workers[id])
      .map(worker => formatWorker(worker));
    return {
      cluster: cluster.settings,
      workers,
    };
  }
}
