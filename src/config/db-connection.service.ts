import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DatabaseConnectionService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'test',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: false,
    };
  }
}
