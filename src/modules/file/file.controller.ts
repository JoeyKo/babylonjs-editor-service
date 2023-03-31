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
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import Utils from 'src/utils/utils';

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
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 50 })],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const userId = 'admin';
    const projectId = '1';
    const fileRes = {};
    for (const file of files) {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8',
      );
      // userId projectId
      const path = `${userId}/${projectId}/`;
      await this.fileService.uploadFile(path + file.originalname, file.buffer, {
        'Content-Type': file.mimetype,
      });
      await this.fileService.create({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: `${userId}/${projectId}/`, // minio file objectName
      });

      const is3DModelFile = Utils.Is3DModelFile(file.originalname);
      if (is3DModelFile) {
        const data = await this.externalServiceLoadFile(
          `${userId}/${projectId}/`,
          file.originalname,
        );

        data['modelSources'] = [
          {
            name: file.originalname,
            url: this.getRootUrl(path) + file.originalname,
          },
        ];

        // Upload base64 image
        const textures = data.textures;
        const fileTextures = {};
        for (const texture of textures) {
          const base64String = texture.base64String;
          if (texture.url && base64String?.indexOf('data:') === 0) {
            const mimetype = base64String.substring(
              base64String.indexOf(':') + 1,
              base64String.indexOf(';'),
            );
            const name =
              texture.name
                .replace(/\(.*?\)/g, '') // 去除（）
                .replace(/(^\s*)|(\s*$)/g, '') + // 去除前后空格
              `.${mimetype.split('/').pop()}`; // 添加文件后缀
            fileTextures[name] = texture;
          }
        }
        for (const filename in fileTextures) {
          const texture = fileTextures[filename];
          const base64String = texture.base64String;
          const mimetype = base64String.substring(
            base64String.indexOf(':') + 1,
            base64String.indexOf(';'),
          );
          await this.fileService.uploadFile(
            path + filename,
            Buffer.from(
              base64String.replace(/^data:image\/\w+;base64,/, ''),
              'base64',
            ),
            {
              'Content-Type': mimetype,
            },
          );
          texture.name = filename;
          texture.base64String = undefined;
          texture.url = this.getRootUrl(path) + filename;
        }
        data.textures = Object.values(fileTextures);
        fileRes[file.originalname] = data;

        // materials
        // metadata: {textureId: ''}
      } else if (file.mimetype.match('image.*')) {
        fileRes[file.originalname] = {
          textures: [
            {
              name: file.originalname,
              url: this.getRootUrl(path) + file.originalname,
            },
          ],
        };
      } else {
        fileRes[file.originalname] = {
          binaries: [
            {
              name: file.originalname,
              url: this.getRootUrl(path) + file.originalname,
            },
          ],
        };
      }
    }

    return fileRes;
  }

  getRootUrl(path: string): string {
    return (
      'http://' +
      this.configService.get('MINIO_ENDPOINT') +
      ':' +
      this.configService.get('MINIO_PORT') +
      '/' +
      this.fileService.BUCKET_NAME +
      '/' +
      path
    );
  }

  async externalServiceLoadFile(path: string, originalname: string) {
    const rootUrl = this.getRootUrl(path);

    const { data } = await firstValueFrom(
      this.httpService
        .post('http://localhost:4100/model/loader', {
          sceneFileName: originalname,
          rootUrl,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw 'Cannot load model file!';
          }),
        ),
    );

    return data;
  }
}
