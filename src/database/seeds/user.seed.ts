import { faker } from '@faker-js/faker';
import { ProfileEntity } from 'src/modules/profile/profile.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as bcrypt from 'bcrypt';
import { EGender, ERole } from 'src/common/enum/enum';
export class UserSeed implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    const defaultPassword = '123';
    const salt: string = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);
    for (let index = 0; index < 100; index++) {
      const user = await connection
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          email: faker.internet.email(),
          password: hashPassword,
        })
        .execute();
      await connection
        .createQueryBuilder()
        .insert()
        .into(ProfileEntity)
        .values({
          fullName: faker.person.fullName(),
          profileId: user['identifiers'][0]['id'],
          role: ERole.EMPLOYEE,
          dob: faker.date.anytime(),
          nationalId: '111',
          gender: faker.person.sex().toUpperCase() as EGender,
          address: faker.location.street(),
          phoneNumber: faker.phone.number(),
          avatar: 'https://picsum.photos/200/300',
        })
        .execute();
    }
  }
}
