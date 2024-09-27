// eslint-disable-next-line @typescript-eslint/no-var-requires
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { v4 as uuidv4 } from 'uuid';

import * as fs from 'fs';
import { AWS_S3 } from 'src/infrastructure/aws3';
import { Sharp } from 'src/infrastructure/sharp';

@Injectable()
export class ImagesService {
  constructor(
    private configService: ConfigService,
    private s3: AWS_S3,
    private sharp: Sharp,
  ) {}

  async uploadFile(file) {
    const { originalname } = file;

    try {
      const responseUploadImageOriginal = await this.s3.uploadImage(
        file.buffer,
        this.s3.AWS_S3_BUCKET + '/pictures',
        originalname,
        file.mimetype,
      );
      return {
        urlImage: responseUploadImageOriginal['Location'],
      };
    } catch (error) {
      throw new BadRequestException('Não foi possível realizar o upload');
    }
  }

  async getImage(query: any, nameImage: string) {
    const promises = [];

    const sharpStream = this.sharp.fail();

    let quality: number;
    let resize: any = {};
    let grayscale: boolean;

    const nameImageSplit = nameImage.split('.');

    const referenceImage = nameImageSplit[0] + '-' + uuidv4() + '.' + query.fm;

    const newNameImageOriginal = uuidv4() + '-' + nameImage;

    try {
      //Verifica se existe o arquivo

      await this.s3.verificationImageExists(
        this.s3.AWS_S3_BUCKET + '/pictures',
        nameImage,
      );
      try {
        await this.s3.downloadImage(
          this.s3.AWS_S3_BUCKET + '/pictures',
          nameImage,
          sharpStream,
        );
      } catch (err) {
        throw new BadRequestException('Erro ao processar a imagem');
      }

      if (
        (query.fm == null || typeof query.fm == 'undefined') &&
        (query.q == null || isNaN(query.q)) &&
        (query.w == null || isNaN(query.w)) &&
        (query.gray == null || isNaN(query.gray))
      ) {
        if (nameImageSplit[1] == 'png') {
          try {
            promises.push(
              this.sharp.convertToPng(sharpStream, newNameImageOriginal),
            );
          } catch (err) {
            throw new BadRequestException('Erro ao processar a imagem');
          }
        }
        if (nameImageSplit[1] == 'jpg' || nameImageSplit[1] == 'jpeg') {
          promises.push(
            this.sharp.convertToJpg(sharpStream, newNameImageOriginal),
          );
        }
        if (nameImageSplit[1] == 'webp') {
          promises.push(
            this.sharp.convertToWebp(sharpStream, newNameImageOriginal),
          );
        }

        const resultPromise = await Promise.all(promises)
          .then(async () => {
            //Descobrindo o buffer da imagem
            const buffer = fs.readFileSync(
              'pictures_resized/' + newNameImageOriginal,
              {},
            );

            try {
              const responseUpload = await this.s3.uploadImage(
                buffer,
                this.s3.AWS_S3_BUCKET + '/pictures-resized',
                newNameImageOriginal,
                'image/' + nameImageSplit[1],
              );

              return responseUpload;
            } catch (error) {
              throw new BadRequestException('Erro ao processar a imagem');
            }
          })
          .catch(() => {
            throw new BadRequestException('Erro ao processar a imagem');
          });

        return {
          urlImage: resultPromise['Location'],
        };
      } else {
        if (query.fm !== null || typeof query.fm !== 'undefined') {
          if (
            query.fm !== 'webp' &&
            query.fm !== 'jpg' &&
            query.fm !== 'png' &&
            query.fm !== 'jpeg'
          ) {
            throw new BadRequestException('Formato de imagem nao suportado');
          } else {
            if (query.q !== null && !isNaN(query.q)) {
              quality = parseInt(query.q);
            } else {
              quality = 80;
            }

            if (
              query.w !== null &&
              !isNaN(query.w) &&
              query.h !== null &&
              !isNaN(query.h)
            ) {
              resize = { width: parseInt(query.w), height: parseInt(query.h) };
            } else {
              resize = {};
            }

            if (query.gray == null || isNaN(query.gray)) {
              grayscale = false;
            }
            if (query.gray == 0) {
              grayscale = false;
            }
            if (query.gray == 1) {
              grayscale = true;
            }

            if (query.fm == 'jpg' || query.fm == 'jpeg') {
              promises.push(
                this.sharp.convertAndRezizeToJpg(
                  sharpStream,
                  quality,
                  grayscale,
                  resize,
                  referenceImage,
                ),
              );
            }
            if (query.fm == 'png') {
              promises.push(
                this.sharp.convertAndRezizeToPng(
                  sharpStream,
                  quality,
                  grayscale,
                  resize,
                  referenceImage,
                ),
              );
            }
            if (query.fm == 'webp') {
              promises.push(
                this.sharp.convertAndRezizeToWebp(
                  sharpStream,
                  quality,
                  grayscale,
                  resize,
                  referenceImage,
                ),
              );
            }

            const resultPromise = await Promise.all(promises)
              .then(async () => {
                //Descobrindo o buffer da imagem
                const buffer = fs.readFileSync(
                  'pictures_resized/' + referenceImage,
                  {},
                );

                try {
                  const responseUpload = await this.s3.uploadImage(
                    buffer,
                    this.s3.AWS_S3_BUCKET + '/pictures-resized',
                    referenceImage,
                    'image/' + query.fm,
                  );

                  return responseUpload;
                } catch (error) {
                  throw new BadRequestException('Erro ao processar a imagem');
                }
              })
              .catch(() => {
                throw new BadRequestException('Erro ao processar a imagem');
              });

            return {
              urlImage: resultPromise['Location'],
            };
          }
        } else {
          if (query.q !== null && !isNaN(query.q)) {
            quality = parseInt(query.q);
          } else {
            quality = 80;
          }

          if (
            query.w !== null &&
            !isNaN(query.w) &&
            query.h !== null &&
            !isNaN(query.h)
          ) {
            resize = { width: parseInt(query.w), height: parseInt(query.h) };
          } else {
            resize = {};
          }

          if (query.gray == null || isNaN(query.gray)) {
            grayscale = false;
          }
          if (query.gray == 0) {
            grayscale = false;
          }
          if (query.gray == 1) {
            grayscale = true;
          }

          if (query == 'jpg' || query == 'jpeg') {
            promises.push(
              this.sharp.convertAndRezizeToJpg(
                sharpStream,
                quality,
                grayscale,
                resize,
                newNameImageOriginal,
              ),
            );
          }

          if (nameImageSplit[1] == 'png') {
            promises.push(
              this.sharp.convertAndRezizeToPng(
                sharpStream,
                quality,
                grayscale,
                resize,
                newNameImageOriginal,
              ),
            );
          }

          if (nameImageSplit[1] == 'webp') {
            promises.push(
              this.sharp.convertAndRezizeToWebp(
                sharpStream,
                quality,
                grayscale,
                resize,
                newNameImageOriginal,
              ),
            );
          }

          const resultPromise = await Promise.all(promises)
            .then(async () => {
              //Descobrindo o buffer da imagem
              const buffer = fs.readFileSync(
                'pictures_resized/' + newNameImageOriginal,
                {},
              );

              try {
                const responseUpload = await this.s3.uploadImage(
                  buffer,
                  this.s3.AWS_S3_BUCKET + '/pictures-resized',
                  newNameImageOriginal,
                  'image/' + nameImageSplit[1],
                );

                return responseUpload;
              } catch (error) {
                throw error;
              }
            })
            .catch(() => {
              throw new BadRequestException('Erro ao processar a imagem');
            });

          return {
            urlImage: resultPromise['Location'],
          };
        }
      }
    } catch (error) {
      throw new NotFoundException('Imagem não encontrada');
    }
  }
}
