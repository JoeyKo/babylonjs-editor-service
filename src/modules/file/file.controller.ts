import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('/v1/file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(files);
    for (const file of files) {
      // userId projectId
      await this.fileService.uploadFiles(file.originalname, file.buffer);
      await this.fileService.create({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: '/', // minio file objectName
      });
    }
  }
}
