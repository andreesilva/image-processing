import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ConfigModule } from '@nestjs/config';
import { AWS_S3 } from 'src/infrastructure/aws3';
import { Sharp } from 'src/infrastructure/sharp';

@Module({
  imports: [ConfigModule],
  controllers: [ImagesController],
  providers: [ImagesService, AWS_S3, Sharp],
})
export class ImagesModule {}
