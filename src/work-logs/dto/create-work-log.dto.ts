import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkLogDto {
    @ApiProperty({ example: 'session-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    sessionId: string;

    @ApiProperty({ example: 'Finished the bricklaying for the north wall.' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Upload up to 5 work photos' })
    photos: any[];
}
