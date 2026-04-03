import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionDto {
    @ApiProperty({ example: 'project-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({ example: 'work-category-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    workCategoryId: string;
}
