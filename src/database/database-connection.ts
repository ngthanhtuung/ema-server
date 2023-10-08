import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const databaseConfig = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: +process.env.MYSQL_PORT,
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  dropSchema: true,
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
  // entities: [__dirname + '/../**/*.entity.{js,ts}'],
  entities: [process.cwd() + '/dist/modules/**/*.entity.{ts,js}'],
  factories: [process.cwd() + '/factory/**/*{.ts,.js}'],
  seeds: [process.cwd() + '/dist/database/seeds/data.seed.js'],
};

export const databaseConnection = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'mysql',
      host: configService.get('MYSQL_HOST'),
      port: configService.get('MYSQL_PORT'),
      username: configService.get('MYSQL_USER') || 'root',
      password: configService.get('MYSQL_PASSWORD'),
      database: configService.get('MYSQL_DB'),
      entities: [process.cwd() + '/dist/modules/**/*.entity.{ts,js}'],
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
      legacySpatialSupport: false,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      timezone: '+07:00',
      migrationsTableName: 'hrea_migration',
      migrations: ['dist/migrations/*{.ts,.js}'],
    }),
  }),
];
