import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { GENRES } from '../../../constants/genres';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(GENRES)
  genre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;
}