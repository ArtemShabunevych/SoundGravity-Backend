import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { GENRES } from '../../../constants/genres';

export class CreateTrackDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(GENRES)
  genre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  cover?: string;
}