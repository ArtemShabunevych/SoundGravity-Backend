import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SetDescriptionDto } from './dto/set-description.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  private readonly cloudinaryService: CloudinaryService,

  ) {}

  async findAll() {
    const users = await this.userRepository.find();

    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userData } = user;
    return userData;
  }
  async setDescription(userId: string, dto: SetDescriptionDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.description = dto.newDescription;

    return this.userRepository.save(user);
  }
  async updateUsername(newUsername: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }


    const existingUser = await this.userRepository.findOne({
      where: {
        username: newUsername,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    user.username = newUsername;

    return this.userRepository.save(user);
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }


    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt
    };
  }

  async getMyProfile(userId: string) {
    const user = await this.findOne(userId);

    return {
      username: user.username,
      createdAt: user.createdAt
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.findOne(userId);

    return {
      username: user.username,
      createdAt: user.createdAt
    };
  }
  async updateAvatar(userId: string, base64String: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const cloudinaryResponse = await this.cloudinaryService.uploadAvatarBase64(base64String);

    user.avatarUrl = cloudinaryResponse.secure_url;

    return this.userRepository.save(user);
  }
}
