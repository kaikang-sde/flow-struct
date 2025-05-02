import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '54.163.61.180',
  port: 3306,
  username: 'root',
  password: 'loveus365',
  database: 'flow-struct',
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};