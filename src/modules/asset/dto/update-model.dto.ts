import { PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-model.dto';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
