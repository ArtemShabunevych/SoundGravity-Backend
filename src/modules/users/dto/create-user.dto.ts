import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Електронна пошта є обов’язковою' })
  @IsEmail({}, { message: 'Некоректний формат електронної пошти' })
  email: string;

  @IsNotEmpty({ message: 'Ім’я користувача є обов’язковим' })
  @IsString({ message: 'Ім’я користувача має бути рядком' })
  @MinLength(3, { message: 'Ім’я користувача має містити мінімум 3 символи' })
  username: string;
}