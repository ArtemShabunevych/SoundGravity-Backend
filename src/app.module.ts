
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { RefreshAccessTokenMiddleware } from "./middleware/refresh-token.middleware";
import { AuthModule } from './modules/auth/auth.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { TracksModule } from './modules/tracks/tracks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    TracksModule,
    PlaylistsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RefreshAccessTokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
