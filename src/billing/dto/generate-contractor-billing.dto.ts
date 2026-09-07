import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class GenerateContractorBillingDto {
  @ApiProperty({ description: 'The ID of the worker' })
  @IsNotEmpty()
  @IsString()
  workerId: string;

  @ApiProperty({ description: 'Start date of the range (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the range (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
