import { IsString, IsNotEmpty } from 'class-validator';

export class CaptchaDto {
    @IsNotEmpty({ message: 'type cannot be empty!' })
    @IsString({ message: 'type must be a string!' })
    type: string;
}