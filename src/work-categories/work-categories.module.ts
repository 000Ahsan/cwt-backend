import { Module } from '@nestjs/common';
import { WorkCategoriesService } from './work-categories.service';
import { WorkCategoriesController } from './work-categories.controller';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [WorkCategoriesController],
    providers: [WorkCategoriesService],
    exports: [WorkCategoriesService],
})
export class WorkCategoriesModule { }
