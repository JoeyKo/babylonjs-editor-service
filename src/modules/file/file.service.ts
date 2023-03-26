import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ItemBucketMetadata, MinioService, UploadedObjectInfo } from '../nestjs-minio';
import internal from 'stream';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileService {
  public BUCKET_NAME = 'babylonjs-editor';
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    private readonly minioService: MinioService,
  ) {}

  async getBuckets() {
    return await this.minioService.listBuckets();
  }

  async bucketExists(bucketName: string) {
    try {
      return await this.minioService.bucketExists(bucketName);
    } catch (error) {
      console.log(error);
    }
  }

  async create(createFileDto: CreateFileDto) {
    return await this.fileRepository.save(createFileDto);
  }

  async uploadFiles(
    objectName: string,
    stream: string | internal.Readable | Buffer,
    metaData?: ItemBucketMetadata,
  ): Promise<UploadedObjectInfo> {
    try {
      const found = await this.bucketExists(this.BUCKET_NAME);
      if (found) {
        return await this.minioService.putObject(
          this.BUCKET_NAME,
          objectName,
          stream,
          metaData,
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
}
