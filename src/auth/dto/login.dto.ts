import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@godfathergame.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin12345' })
  @IsString()
  @MinLength(1)
  password!: string;
}
