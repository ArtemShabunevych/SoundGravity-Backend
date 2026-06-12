import { BadRequestException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private authRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.authRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.authRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });

    const savedUser = await this.authRepository.save(user);

    const payload = { userId: savedUser.id, username: savedUser.username };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '2h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const { password, ...userData } = savedUser;
    return {
      user: userData,
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginUserDto) {
    const user = await this.authRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '2h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const { password, ...userData } = user;
    return { user: userData, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const newAccessToken = this.jwtService.sign(
        { userId: payload.userId, username: payload.username },
        { expiresIn: '2h' },
      );
      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token);
  }
  async loginOrCreateGoogleUser(googleUser: { email: string; username: string }) {

    let user = await this.authRepository.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {

      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = this.authRepository.create({
        email: googleUser.email,
        username: googleUser.username,
        password: hashedPassword,
      });

      user = await this.authRepository.save(user);
    }
  }
}
