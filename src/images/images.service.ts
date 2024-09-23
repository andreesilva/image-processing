// eslint-disable-next-line @typescript-eslint/no-var-requires
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

import * as fs from 'fs';

@Injectable()
export class ImagesService {
  constructor(private configService: ConfigService) {}

  AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
  s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async uploadFile(file) {
    const { originalname } = file;

    try {
      const responseUploadImageOriginal = await this.s3_upload(
        file.buffer,
        this.AWS_S3_BUCKET + '/pictures',
        originalname,
        file.mimetype,
      );
      return {
        urlImage: responseUploadImageOriginal['Location'],
      };
    } catch (error) {
      throw error;
    }
  }

  async getImage(query: any, nameImage: string) {
    const promises = [];

    const sharpStream = sharp({ failOn: 'none' });

    let quality: number;
    let resize: any = {};
    let grayscale: boolean;

    const nameImageSplit = nameImage.split('.');

    const referenceImage = nameImageSplit[0] + '-' + uuidv4() + '.' + query.fm;

    const newNameImageOriginal = uuidv4() + '-' + nameImage;

    const downloadParams = {
      Bucket: this.AWS_S3_BUCKET + '/pictures',
      Key: nameImage,
    };

    try {
      //Verifica se existe o arquivo
      await this.s3.headObject(downloadParams).promise();

      //Baixando imagem do S3
      this.s3
        .getObject({
          Bucket: this.AWS_S3_BUCKET + '/pictures',
          Key: nameImage,
        })
        .createReadStream()
        .pipe(sharpStream);

      if (
        (query.fm == null || typeof query.fm == 'undefined') &&
        (query.q == null || isNaN(query.q)) &&
        (query.w == null || isNaN(query.w)) &&
        (query.gray == null || isNaN(query.gray))
      ) {
        if (nameImageSplit[1] == 'png') {
          promises.push(
            sharpStream
              .clone()
              .png({ quality: 85 })
              .toFile('pictures_resized/' + newNameImageOriginal),
          );
        }
        if (nameImageSplit[1] == 'jpg') {
          promises.push(
            sharpStream
              .clone()
              .jpeg({ quality: 85 })
              .toFile('pictures_resized/' + newNameImageOriginal),
          );
        }
        if (nameImageSplit[1] == 'webp') {
          promises.push(
            sharpStream
              .clone()
              .webp({ quality: 85 })
              .toFile('pictures_resized/' + newNameImageOriginal),
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
              //Subindo imagem para o S3
              const responseUpload = await this.s3_upload(
                buffer,
                this.AWS_S3_BUCKET + '/pictures-resized',
                newNameImageOriginal,
                'image/' + nameImageSplit[1],
              );

              return responseUpload;
            } catch (error) {
              throw error;
            }
          })
          .catch((err) => {
            console.error('Erro ao processar a imagem', err);
          });

        return {
          urlImage: resultPromise['Location'],
        };
      } else {
        if (query.fm !== null || typeof query.fm !== 'undefined') {
          if (query.fm !== 'webp' && query.fm !== 'jpg' && query.fm !== 'png') {
            return {
              message: 'Formato de imagem não suportado',
            };
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

            if (query.fm == 'jpg') {
              promises.push(
                sharpStream
                  .clone()
                  .jpeg({ quality: quality })
                  .grayscale(grayscale)
                  .resize(resize)
                  .toFile('pictures_resized/' + referenceImage),
              );
            }
            if (query.fm == 'png') {
              promises.push(
                sharpStream
                  .clone()
                  .png({ quality: quality })
                  .grayscale(grayscale)
                  .resize(resize)
                  .toFile('pictures_resized/' + referenceImage),
              );
            }
            if (query.fm == 'webp') {
              promises.push(
                sharpStream
                  .clone()
                  .webp({ quality: quality })
                  .grayscale(grayscale)
                  .resize(resize)
                  .toFile('pictures_resized/' + referenceImage),
              );
            }

            const resultPromise = await Promise.all(promises)
              .then(async (res) => {
                console.log('Sucesso', res);

                //Descobrindo o buffer da imagem
                const buffer = fs.readFileSync(
                  'pictures_resized/' + referenceImage,
                  {},
                );

                try {
                  //Subindo imagem para o S3
                  const responseUpload = await this.s3_upload(
                    buffer,
                    this.AWS_S3_BUCKET + '/pictures-resized',
                    referenceImage,
                    'image/' + query.fm,
                  );

                  return responseUpload;
                } catch (error) {
                  throw error;
                }
              })
              .catch((err) => {
                console.error('Erro ao processar a imagem', err);
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

          if (query == 'jpg') {
            promises.push(
              sharpStream
                .clone()
                .jpeg({ quality: quality })
                .grayscale(grayscale)
                .resize(resize)
                .toFile('pictures_resized/' + newNameImageOriginal),
            );
          }

          if (nameImageSplit[1] == 'png') {
            promises.push(
              sharpStream
                .clone()
                .png({ quality: quality })
                .grayscale(grayscale)
                .resize(resize)
                .toFile('pictures_resized/' + newNameImageOriginal),
            );
          }

          if (nameImageSplit[1] == 'webp') {
            promises.push(
              sharpStream
                .clone()
                .webp({ quality: quality })
                .grayscale(grayscale)
                .resize(resize)
                .toFile('pictures_resized/' + newNameImageOriginal),
            );
          }

          const resultPromise = await Promise.all(promises)
            .then(async (res) => {
              console.log('Sucesso!', res);

              //Descobrindo o buffer da imagem
              const buffer = fs.readFileSync(
                'pictures_resized/' + newNameImageOriginal,
                {},
              );

              try {
                //Subindo imagem para o S3
                const responseUpload = await this.s3_upload(
                  buffer,
                  this.AWS_S3_BUCKET + '/pictures-resized',
                  newNameImageOriginal,
                  'image/' + nameImageSplit[1],
                );

                return responseUpload;
              } catch (error) {
                throw error;
              }
            })
            .catch((err) => {
              console.error('Erro ao processar a imagem', err);
            });

          return {
            urlImage: resultPromise['Location'],
          };
        }
      }
    } catch (headErr: any) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Imagem não encontrada',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: headErr,
        },
      );
    }
  }

  async s3_upload(file, bucket, referenceImage, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(referenceImage),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION,
      },
    };

    try {
      const s3Response = await this.s3.upload(params).promise();

      //Verificar se o arquivo existe na pasta
      const fileExists = fs.existsSync('pictures_resized/' + referenceImage);
      if (fileExists == true) {
        //Exclui a imagem temporária que foi salva na pasta "pictures_resized"
        fs.unlinkSync('pictures_resized/' + referenceImage);
      }

      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
}
