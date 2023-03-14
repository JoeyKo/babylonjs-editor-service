import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { Node } from './nodes/node.entity';

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node) private nodeRepository: Repository<Node>,
  ) {}
  create(createNodeDto: CreateNodeDto) {
    return this.nodeRepository.save(createNodeDto);
  }

  findAll() {
    return this.nodeRepository.find();
  }

  findOne(id: number) {
    return this.nodeRepository.findOneBy({ id });
  }

  async update(id: number, updateNodeDto: UpdateNodeDto) {
    const existNode = await this.findOne(id);
    if (!existNode) {
      throw new Error('该实体不存在');
    }
    return this.nodeRepository.save({ id: existNode.id, ...updateNodeDto });
  }

  async remove(id: number) {
    const existNode = await this.findOne(id);
    if (!existNode) {
      throw new Error('该实体不存在');
    }
    return this.nodeRepository.remove(existNode);
  }
}
