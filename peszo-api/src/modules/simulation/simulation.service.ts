import { AppError } from '../../utils/response';
import { SimulationState } from './simulation.types';

export class SimulationService {
  async advanceMonth(_userId: string): Promise<SimulationState> {
    // TODO: implement when Simulation module is built
    // This will use prisma.simulation.findUnique() to get current state
    // This will use prisma.simulation.create() or prisma.simulation.update()
    throw new AppError('Not implemented', 501);
  }

  async getSimulationState(_userId: string): Promise<SimulationState | null> {
    // TODO: implement when Simulation module is built
    // This will use prisma.simulation.findUnique() to get simulation state
    throw new AppError('Not implemented', 501);
  }
}
