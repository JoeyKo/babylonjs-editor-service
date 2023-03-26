import { IsNotEmpty } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  path: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  size: number;
}
