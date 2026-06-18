import { IsString } from 'class-validator';

export class SetDescriptionDto {
  @IsString()
  newDescription: string;
}