import { IsNumber, IsNotEmpty } from 'class-validator';

export class FindUserDto {
    @IsNotEmpty({ message: 'id cannot be empty!' })
    @IsNumber(
        {
            allowNaN: false,
            allowInfinity: false,
        },
        { message: 'id must be a number!' },
    )
    id: string;
}