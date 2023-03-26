import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { MinioModule } from './modules/nestjs-minio';
import * as joi from 'joi';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AssetModule } from './modules/asset/asset.module';
import { NodeModule } from './modules/node/node.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: joi.object({
        APP_ENV: joi
          .string()
          .valid('development', 'production')
          .default('development'),
        DB_TYPE: joi.string().default('mysql'),
        DB_USERNAME: joi.string().default('root'),
        DB_PASSWORD: joi.string().default('123456'),
        DB_HOST: joi.string().default('localhost'),
        DB_PORT: joi.number().default('3306'),
        DB_DATABASE: joi.string().default('babylonjseditor_db'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/**.entity{.ts,.js}'],
          synchronize: configService.get('APP_ENV') === 'development',
          autoLoadEntities: true,
          logging: true,
          timezone: 'Z',
          keepConnectionAlive: true,
        } as TypeOrmModuleAsyncOptions;
      },
    }),
    MinioModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          port: +configService.get('MINIO_PORT'),
          endPoint: configService.get('MINIO_ENDPOINT'),
          accessKey: configService.get('MINIO_ROOT_USER'),
          secretKey: configService.get('MINIO_ROOT_PASSWORD'),
          useSSL: false
        };
      },
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('APP_ENV') === 'development'
          ? {
              level: 'info',
              format: winston.format.json(),
              defaultMeta: { service: 'nest-typeorm-service' },
              transports: [
                new winston.transports.Console({
                  format: winston.format.simple(),
                }),
              ],
            }
          : {
              level: 'info',
              format: winston.format.json(),
              defaultMeta: { service: 'nest-typeorm-service' },
              transports: [
                new winston.transports.File({
                  filename: 'logs/error.log',
                  level: 'error',
                }),
                new winston.transports.Console({
                  format: winston.format.simple(),
                }),
              ],
            };
      },
    }),
    AssetModule,
    NodeModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
