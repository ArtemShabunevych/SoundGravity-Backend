import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  newUsername: string;
}
