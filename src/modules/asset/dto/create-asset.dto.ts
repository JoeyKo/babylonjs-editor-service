import { ApiProperty } from '@nestjs/swagger';
import { AssetType } from '../entities/asset';
import { IsNotEmpty } from 'class-validator';

export class CreateAssetDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty()
  parentId: number | null;

  @ApiProperty({ enum: AssetType })
  @IsNotEmpty()
  type: AssetType;
}
