import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Asset } from './entities/asset';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset) private assetRepository: Repository<Asset>,
  ) {}
  create(createAssetDto: CreateAssetDto): Promise<CreateAssetDto> {
    return this.assetRepository.save(createAssetDto);
  }

  findAll() {
    return this.assetRepository.find();
  }

  findOne(id: number) {
    return this.assetRepository.findOneBy({ id });
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    const existAsset = await this.findOne(id);
    if (!existAsset) {
      throw new Error('该资源不存在');
    }
    return this.assetRepository.save({ id: existAsset.id, ...updateAssetDto });
  }

  async remove(id: number) {
    const existAsset = await this.findOne(id);
    if (!existAsset) {
      throw new Error('该资源不存在');
    }
    return this.assetRepository.remove(existAsset);
  }
}
