import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
export declare class ImagesService {
    private configService;
    constructor(configService: ConfigService);
    AWS_S3_BUCKET: string;
    s3: S3;
    uploadFile(file: any): Promise<{
        urlImage: string;
    }>;
    getImage(query: any, nameImage: string): Promise<{
        urlImage: any;
        message?: undefined;
    } | {
        message: string;
        urlImage?: undefined;
    }>;
    s3_upload(file: any, bucket: any, referenceImage: any, mimetype: any): Promise<S3.ManagedUpload.SendData>;
}
