import { S3 } from 'aws-sdk';

import * as fs from 'fs';

export class AWS_S3 {
  AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;

  s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async uploadImage(file, bucket, referenceImage, mimetype) {
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
      const response = await this.s3.upload(params).promise();

      //Verificar se o arquivo existe na pasta
      const fileExists = fs.existsSync('pictures_resized/' + referenceImage);
      if (fileExists == true) {
        //Exclui a imagem temporária que foi salva na pasta "pictures_resized"
        fs.unlinkSync('pictures_resized/' + referenceImage);
      }

      return response;
    } catch (Exception) {
      throw Exception;
    }
  }
  async downloadImage(bucket, referenceImage, sharpStream) {
    try {
      const response = await this.s3
        .getObject({
          Bucket: bucket,
          Key: referenceImage,
        })
        .createReadStream()
        .pipe(sharpStream);

      return response;
    } catch (Exception) {
      throw Exception;
    }
  }

  async verificationImageExists(bucket, nameImage) {
    try {
      const response = await this.s3
        .headObject({
          Bucket: bucket,
          Key: nameImage,
        })
        .promise();

      return response;
    } catch (Exception) {
      throw Exception;
    }
  }
}
