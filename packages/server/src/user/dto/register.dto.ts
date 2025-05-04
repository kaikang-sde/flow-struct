import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'phone cannot be empty!' })
    @IsString({ message: 'phone must be a string!' })
    phone: string;

    @IsNotEmpty({ message: 'sendCode cannot be empty!' })
    @IsString({ message: 'sendCode must be a string!' })
    sendCode: string;

    @IsNotEmpty({ message: 'password cannot be empty!' })
    @IsString({ message: 'password must be a string!' })
    password: string;

    @IsNotEmpty({ message: 'confirm cannot be empty!' })
    @IsString({ message: 'confirm must be a string!' })
    confirm: string;

}