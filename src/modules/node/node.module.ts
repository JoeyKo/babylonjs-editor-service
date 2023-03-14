import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './nodes/node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Node])],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
