import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";

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
            entities: ['dist/**/*.entity.{ts,js}'],
            synchronize: true,
            logging: false,
            autoLoadEntities: true,
            legacySpatialSupport: false,
            charset: 'utf8mb4',
            collation: 'utf8mb4_unicode_ci',
            timezone: '+07:00',
        }),
    })
]