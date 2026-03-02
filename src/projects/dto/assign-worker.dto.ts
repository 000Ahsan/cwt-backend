import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignWorkerDto {
    @ApiProperty({ example: 'worker-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    workerId: string;
}
