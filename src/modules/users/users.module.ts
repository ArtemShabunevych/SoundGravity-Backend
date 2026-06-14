import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Like } from '../likes/entities/like.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
@Module({
  imports: [TypeOrmModule.forFeature([User, Like]),CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService,],
  exports: [UsersService,],
})
export class UsersModule {}