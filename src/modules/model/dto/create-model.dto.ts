import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty()
  name: string;
}
