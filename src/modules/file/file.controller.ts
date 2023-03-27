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
  Logger,
} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('/v1/file')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  constructor(
    private readonly fileService: FileService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    const userId = 'admin';
    const projectId = '1';
    const fileRes = {};
    for (const file of files) {
      console.log(file)
      // userId projectId
      const path = `${userId}/${projectId}/`;
      await this.fileService.uploadFile(path + file.originalname, file.buffer);
      await this.fileService.create({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: `${userId}/${projectId}/`, // minio file objectName
      });

      const data = await this.externalServiceLoadFile(
        `${userId}/${projectId}/`,
        file.originalname,
      );
      fileRes[file.originalname] = data;
    }

    return fileRes;
  }

  async externalServiceLoadFile(path: string, originalname: string) {
    const rootUrl =
      'http://' +
      this.configService.get('MINIO_ENDPOINT') +
      ':' +
      this.configService.get('MINIO_PORT') +
      '/' +
      this.fileService.BUCKET_NAME +
      '/' +
      path;

    const { data } = await firstValueFrom(
      this.httpService
        .post('http://localhost:4100/model/loader', {
          sceneFileName: originalname,
          rootUrl,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw 'An error happened!';
          }),
        ),
    );

    return data.data;
  }
}
