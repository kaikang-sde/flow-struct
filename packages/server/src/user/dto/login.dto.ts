import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordLoginDto {
    @IsNotEmpty({ message: 'phone cannot be empty!' })
    @IsString({ message: 'phone must be a string!' })
    phone: string;

    @IsNotEmpty({ message: 'password cannot be empty!' })
    @IsString({ message: 'password must be a string!' })
    password: string;
}


export class SmsLoginDto {
    @IsNotEmpty({ message: 'phone cannot be empty!' })
    @IsString({ message: 'phone must be a string!' })
    phone: string;

    @IsNotEmpty({ message: 'sendCode cannot be empty!' })
    @IsString({ message: 'sendCode must be a string!' })
    sendCode: string;
}