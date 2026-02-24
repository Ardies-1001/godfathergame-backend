import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'f2b0f87b19f2c1f78a8a84cdbdb18f7ea86e3d99a0ea90c6b8a0898ddc4e3f54',
  })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'newPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
