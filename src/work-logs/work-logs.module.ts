import { Module } from '@nestjs/common';
import { WorkLogsService } from './work-logs.service';
import { WorkLogsController } from './work-logs.controller';
import { WorkPhotosController } from './work-photos.controller';

@Module({
  providers: [WorkLogsService],
  controllers: [WorkLogsController, WorkPhotosController],
})
export class WorkLogsModule { }
