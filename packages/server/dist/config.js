"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
exports.typeOrmConfig = {
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
//# sourceMappingURL=config.js.map