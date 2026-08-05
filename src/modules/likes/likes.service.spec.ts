import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Track } from '../tracks/entities/track.entity';
import { Playlist } from '../playlists/entities/playlist.entity';

describe('LikesService', () => {
  let service: LikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        { provide: getRepositoryToken(Like), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Track), useValue: {} },
        { provide: getRepositoryToken(Playlist), useValue: {} },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
