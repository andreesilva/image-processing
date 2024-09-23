"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const config_1 = require("@nestjs/config");
require('dotenv').config();
const uuid_1 = require("uuid");
const sharp = require("sharp");
const fs = require("fs");
let ImagesService = class ImagesService {
    constructor(configService) {
        this.configService = configService;
        this.AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
        this.s3 = new aws_sdk_1.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }
    async uploadFile(file) {
        const { originalname } = file;
        try {
            const responseUploadImageOriginal = await this.s3_upload(file.buffer, this.AWS_S3_BUCKET + '/pictures', originalname, file.mimetype);
            return {
                urlImage: responseUploadImageOriginal['Location'],
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getImage(query, nameImage) {
        const promises = [];
        const sharpStream = sharp({ failOn: 'none' });
        let quality;
        let resize = {};
        let grayscale;
        const nameImageSplit = nameImage.split('.');
        const referenceImage = nameImageSplit[0] + '-' + (0, uuid_1.v4)() + '.' + query.fm;
        const newNameImageOriginal = (0, uuid_1.v4)() + '-' + nameImage;
        const downloadParams = {
            Bucket: this.AWS_S3_BUCKET + '/pictures',
            Key: nameImage,
        };
        try {
            await this.s3.headObject(downloadParams).promise();
            this.s3
                .getObject({
                Bucket: this.AWS_S3_BUCKET + '/pictures',
                Key: nameImage,
            })
                .createReadStream()
                .pipe(sharpStream);
            if ((query.fm == null || isNaN(query.fm)) &&
                (query.q == null || isNaN(query.q)) &&
                (query.w == null || isNaN(query.w)) &&
                (query.gray == null || isNaN(query.gray))) {
                if (nameImageSplit[1] == 'png') {
                    promises.push(sharpStream
                        .clone()
                        .png({ quality: 85 })
                        .toFile('pictures_resized/' + newNameImageOriginal));
                }
                if (nameImageSplit[1] == 'jpg') {
                    promises.push(sharpStream
                        .clone()
                        .jpeg({ quality: 85 })
                        .toFile('pictures_resized/' + newNameImageOriginal));
                }
                if (nameImageSplit[1] == 'webp') {
                    promises.push(sharpStream
                        .clone()
                        .webp({ quality: 85 })
                        .toFile('pictures_resized/' + newNameImageOriginal));
                }
                const resultPromise = await Promise.all(promises)
                    .then(async () => {
                    const buffer = fs.readFileSync('pictures_resized/' + newNameImageOriginal, {});
                    try {
                        const responseUpload = await this.s3_upload(buffer, this.AWS_S3_BUCKET + '/pictures-resized', newNameImageOriginal, 'image/' + nameImageSplit[1]);
                        return responseUpload;
                    }
                    catch (error) {
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
            else {
                if (query.fm !== null && typeof query.fm !== 'undefined') {
                    if (query.fm !== 'webp' && query.fm !== 'jpg' && query.fm !== 'png') {
                        return {
                            message: 'Formato de imagem não suportado',
                        };
                    }
                    else {
                        if (query.q !== null && !isNaN(query.q)) {
                            quality = parseInt(query.q);
                        }
                        else {
                            quality = 80;
                        }
                        if (query.w !== null &&
                            !isNaN(query.w) &&
                            query.h !== null &&
                            !isNaN(query.h)) {
                            resize = { width: parseInt(query.w), height: parseInt(query.h) };
                        }
                        else {
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
                            promises.push(sharpStream
                                .clone()
                                .jpeg({ quality: quality })
                                .grayscale(grayscale)
                                .resize(resize)
                                .toFile('pictures_resized/' + referenceImage));
                        }
                        if (query.fm == 'png') {
                            promises.push(sharpStream
                                .clone()
                                .png({ quality: quality })
                                .grayscale(grayscale)
                                .resize(resize)
                                .toFile('pictures_resized/' + referenceImage));
                        }
                        if (query.fm == 'webp') {
                            promises.push(sharpStream
                                .clone()
                                .webp({ quality: quality })
                                .grayscale(grayscale)
                                .resize(resize)
                                .toFile('pictures_resized/' + referenceImage));
                        }
                        const resultPromise = await Promise.all(promises)
                            .then(async (res) => {
                            console.log('Sucesso', res);
                            const buffer = fs.readFileSync('pictures_resized/' + referenceImage, {});
                            try {
                                const responseUpload = await this.s3_upload(buffer, this.AWS_S3_BUCKET + '/pictures-resized', referenceImage, 'image/' + query.fm);
                                return responseUpload;
                            }
                            catch (error) {
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
                else {
                    if (query.q !== null && !isNaN(query.q)) {
                        quality = parseInt(query.q);
                    }
                    else {
                        quality = 80;
                    }
                    if (query.w !== null &&
                        !isNaN(query.w) &&
                        query.h !== null &&
                        !isNaN(query.h)) {
                        resize = { width: parseInt(query.w), height: parseInt(query.h) };
                    }
                    else {
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
                    if (nameImageSplit[1] == 'jpg') {
                        promises.push(sharpStream
                            .clone()
                            .jpeg({ quality: quality })
                            .grayscale(grayscale)
                            .resize(resize)
                            .toFile('pictures_resized/' + newNameImageOriginal));
                    }
                    if (nameImageSplit[1] == 'png') {
                        promises.push(sharpStream
                            .clone()
                            .png({ quality: quality })
                            .grayscale(grayscale)
                            .resize(resize)
                            .toFile('pictures_resized/' + newNameImageOriginal));
                    }
                    if (nameImageSplit[1] == 'webp') {
                        promises.push(sharpStream
                            .clone()
                            .webp({ quality: quality })
                            .grayscale(grayscale)
                            .resize(resize)
                            .toFile('pictures_resized/' + newNameImageOriginal));
                    }
                    const resultPromise = await Promise.all(promises)
                        .then(async (res) => {
                        console.log('Sucesso!', res);
                        const buffer = fs.readFileSync('pictures_resized/' + newNameImageOriginal, {});
                        try {
                            const responseUpload = await this.s3_upload(buffer, this.AWS_S3_BUCKET + '/pictures-resized', newNameImageOriginal, 'image/' + nameImageSplit[1]);
                            return responseUpload;
                        }
                        catch (error) {
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
        }
        catch (headErr) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.FORBIDDEN,
                error: 'Imagem não encontrada',
            }, common_1.HttpStatus.FORBIDDEN, {
                cause: headErr,
            });
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
            const fileExists = fs.existsSync('pictures_resized/' + referenceImage);
            if (fileExists == true) {
                fs.unlinkSync('pictures_resized/' + referenceImage);
            }
            return s3Response;
        }
        catch (e) {
            console.log(e);
        }
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImagesService);
//# sourceMappingURL=images.service.js.map