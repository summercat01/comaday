import { IsNumber, IsArray, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferItem {
  @IsNumber()
  receiverId: number;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class BulkTransferDto {
  @IsNumber()
  senderId: number;

  @IsString()
  roomCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferItem)
  transfers: TransferItem[];

  @IsOptional()
  @IsString()
  description?: string;
}
