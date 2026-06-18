import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Track } from '../modules/tracks/entities/track.entity';
import { Playlist } from '../modules/playlists/entities/playlist.entity';
import { Like } from '../modules/likes/entities/like.entity';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [User, Track, Playlist, Like],
    synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
    ssl:true
  }),
};
