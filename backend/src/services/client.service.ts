import { ClientRepository } from '../repositories/client.repository';
import { NotFoundError } from '../types/errors';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

const clientRepo = new ClientRepository();

export class ClientService {
  async findAll() {
    return clientRepo.findAll();
  }

  async findById(id: string) {
    const client = await clientRepo.findById(id);
    if (!client) {
      throw new NotFoundError('客户不存在');
    }
    return client;
  }

  async create(dto: CreateClientDto) {
    return clientRepo.create(dto);
  }

  async update(id: string, dto: UpdateClientDto) {
    return clientRepo.update(id, dto);
  }

  async delete(id: string) {
    return clientRepo.delete(id);
  }
}
