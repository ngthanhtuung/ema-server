import { faker } from '@faker-js/faker';
import { ProfileEntity } from 'src/modules/profile/profile.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as bcrypt from 'bcrypt';
import { EEventStatus, EGender, ERole } from 'src/common/enum/enum';
import { DivisionEntity } from 'src/modules/division/division.entity';
import { EventEntity } from 'src/modules/event/event.entity';
export class UserSeed implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    const defaultPassword = '123456';
    const salt: string = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);
    const divison1 = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values({
        divisionName: 'Hậu cần',
        description: 'Test desc',
      })
      .execute();
    const divison2 = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values({
        divisionName: 'Phòng Thiết Kế',
        description: 'Test desc',
      })
      .execute();
    const divison3 = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values({
        divisionName: 'Phòng Planing',
        description: 'Test desc',
      })
      .execute();
    const manager = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: 'huydoanmec@gmail.com',
        password: hashPassword,
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: 'Doan Vu Quang Huy',
        profileId: manager['identifiers'][0]['id'],
        role: ERole.MANAGER,
        dob: faker.date.anytime(),
        nationalId: '111',
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      })
      .execute();
    const staff = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: 'quanghuy0610.dev@gmail.com',
        password: hashPassword,
        division: {
          id: divison1['identifiers'][0]['id'],
        },
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: 'Doan Vu Quang Huy',
        profileId: staff['identifiers'][0]['id'],
        role: ERole.STAFF,
        dob: faker.date.anytime(),
        nationalId: '111',
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      })
      .execute();
    const employee = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: 'huydvqse151224@fpt.edu.vn',
        password: hashPassword,
        division: {
          id: divison1['identifiers'][0]['id'],
        },
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: 'Doan Vu Quang Huy',
        profileId: staff['identifiers'][0]['id'],
        role: ERole.EMPLOYEE,
        dob: faker.date.anytime(),
        nationalId: '111',
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      })
      .execute();
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
