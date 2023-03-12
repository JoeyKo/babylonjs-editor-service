import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssetType {
  MODELSROUCE = 'model_source',
  MODEL = 'model',
  MESH = 'mesh',
  MATERIAL = 'material',
  TEXTURE = 'texture',
}

@Entity({
  name: 'asset',
})
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column({
    type: 'enum',
    enum: AssetType,
  })
  type: AssetType;

  @Column('json', { default: null })
  metadata: any;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
