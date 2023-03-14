import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNodeDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  parentId: number | null;
}
