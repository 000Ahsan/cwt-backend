import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionDto {
    @ApiProperty({ example: 'project-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;
}
