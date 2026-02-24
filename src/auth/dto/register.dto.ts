import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'admin@godfathergame.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin12345', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'Administrateur' })
  @IsOptional()
  @IsString()
  name?: string;
}
