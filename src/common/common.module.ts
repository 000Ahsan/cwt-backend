import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { FileService } from './file/file.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Global()
@Module({
  imports: [CloudinaryModule],
  providers: [PrismaService, FileService],
  exports: [PrismaService, FileService, CloudinaryModule]
})
export class CommonModule { }
