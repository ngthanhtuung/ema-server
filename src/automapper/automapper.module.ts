import { Module } from '@nestjs/common';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';

@Module({
    imports: [
        AutomapperModule.forRoot({
            options: [
                {
                    name: "classes",
                    pluginInitializer: classes,
                }
            ],
            singular: true,
        }),
    ],
})
export class AutoMapperModule { }
