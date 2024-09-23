import { ImagesService } from './images.service';
export declare class ImagesController {
    private readonly imagesService;
    constructor(imagesService: ImagesService);
    getHello(): string;
    uploadFile(file: Express.Multer.File): Promise<{
        urlImage: string;
    }>;
    image(query: any, nameImage: string): Promise<{
        urlImage: any;
        message?: undefined;
    } | {
        message: string;
        urlImage?: undefined;
    }>;
}
