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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const images_service_1 = require("./images.service");
const inspector_1 = require("inspector");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
let ImagesController = class ImagesController {
    constructor(imagesService) {
        this.imagesService = imagesService;
    }
    getHello() {
        return 'API de Procesamento de imagem';
    }
    uploadFile(file) {
        inspector_1.console.log('file', file);
        try {
            return this.imagesService.uploadFile(file);
        }
        catch (error) {
            throw error;
        }
    }
    image(query, nameImage) {
        try {
            inspector_1.console.log(nameImage);
            return this.imagesService.getImage(query, nameImage);
        }
        catch (error) {
            throw error;
        }
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], ImagesController.prototype, "getHello", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ImagesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':nameImage'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Param)('nameImage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ImagesController.prototype, "image", null);
exports.ImagesController = ImagesController = __decorate([
    (0, common_1.Controller)('api/images'),
    __metadata("design:paramtypes", [images_service_1.ImagesService])
], ImagesController);
//# sourceMappingURL=images.controller.js.map