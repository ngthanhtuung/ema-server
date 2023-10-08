import { faker } from '@faker-js/faker';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { EEventStatus } from 'src/common/enum/enum';
import { EventEntity } from 'src/modules/event/event.entity';
export class UserSeed implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    for (let index = 0; index < 10; index++) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(EventEntity)
        .values({
          eventName: `Test name event ${index + 1}`,
          startDate: faker.date.anytime(),
          endDate: faker.date.anytime(),
          location: 'Quan 12',
          description: faker.lorem.paragraph(),
          coverUrl: faker.image.avatar(),
          estBudget: Number(
            faker.commerce.price({ min: 1000000, max: 200000000 }),
          ),
          status: EEventStatus.PROCESSING,
          createdAt: faker.date.anytime(),
          updatedAt: faker.date.anytime(),
        })
        .execute();
    }
  }
}
