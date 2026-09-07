import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { FileService } from './file/file.service';

@Global()
@Module({
  providers: [PrismaService, FileService],
  exports: [PrismaService, FileService],
})
export class CommonModule { }
