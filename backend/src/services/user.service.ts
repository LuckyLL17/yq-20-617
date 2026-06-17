import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundError } from '../types/errors';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const userRepo = new UserRepository();

export class UserService {
  async findAll() {
    return userRepo.findAllActive();
  }

  async findLawyers() {
    return userRepo.findLawyers();
  }

  async findById(id: string) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return user;
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return userRepo.create({ ...dto, passwordHash });
  }

  async update(id: string, dto: UpdateUserDto) {
    const { password, ...data } = dto;
    const updateData: any = { ...data };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    return userRepo.update(id, updateData);
  }

  async softDelete(id: string) {
    return userRepo.softDelete(id);
  }
}
