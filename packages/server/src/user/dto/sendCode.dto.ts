import { IsString, IsNotEmpty } from 'class-validator';

export class SendCodeDto {
    @IsNotEmpty({ message: 'type cannot be empty!' })
    @IsString({ message: 'type must be a string!' })
    type: string;

    @IsNotEmpty({ message: 'phone cannot be empty!' })
    @IsString({ message: 'phone must be a string!' })
    phone: string;

    @IsNotEmpty({ message: 'captcha cannot be empty!' })
    @IsString({ message: 'captcha must be a string!' })
    captcha: string;


}