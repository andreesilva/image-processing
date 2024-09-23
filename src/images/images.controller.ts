import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';

import { console } from 'inspector';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('api/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  getHello(): string {
    return 'API de Procesamento de imagem';
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    try {
      return this.imagesService.uploadFile(file);
    } catch (error) {
      throw error;
    }
  }

  @Get(':nameImage')
  image(@Query() query: any, @Param('nameImage') nameImage: string) {
    try {
      console.log(nameImage);
      return this.imagesService.getImage(query, nameImage);
    } catch (error) {
      throw error;
    }
  }
}
