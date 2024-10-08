import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { ImagesService } from './images.service';

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
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpg|jpeg|png|webp',
        })

        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      return this.imagesService.uploadFile(file);
    } catch (error) {
      throw error;
    }
  }

  @Get(':nameImage')
  image(@Query() query: any, @Param('nameImage') nameImage: string) {
    try {
      return this.imagesService.getImage(query, nameImage);
    } catch (error) {
      throw error;
    }
  }
}
