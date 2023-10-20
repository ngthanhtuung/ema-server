import { faker } from '@faker-js/faker';
import { ProfileEntity } from 'src/modules/profile/profile.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as bcrypt from 'bcrypt';
import { EEventStatus, EGender, ERole } from 'src/common/enum/enum';
import { DivisionEntity } from 'src/modules/division/division.entity';
import { EventEntity } from 'src/modules/event/event.entity';
import Mail from 'src/modules/mail/mail.entity';
export class DataSeed implements Seeder {
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
        nationalId: faker.random.numeric(12).toString(),
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
        nationalId: faker.random.numeric(12).toString(),
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
        profileId: employee['identifiers'][0]['id'],
        role: ERole.EMPLOYEE,
        dob: faker.date.anytime(),
        nationalId: faker.random.numeric(12).toString(),
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
    const mailTextId1 =
      '<p>Welcome to the HREA System, your account is: </p><strong>Email: </strong> ${email} <br><strong>Password: </strong> ${password}';
    const mailTitleId1 = 'Chào mừng tới hệ thống HREA';
    const mailTextId2 =
      '<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;"> <h2>Xác Nhận Mã</h2> <p>Xin chào,</p> <p>Dưới đây là mã xác nhận của tên đăng nhập ${email}:</p> <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3> <p>Vui lòng sử dụng mã này để hoàn tất quá trình xác thực.</p> <p>Lưu ý mã này chỉ có thời hạn 10 phút.</p> <p>Trân trọng,</p> <p>Đội ngũ hỗ trợ của chúng tôi( HREA System)</p> </div>';
    const mailTitleId2 = 'Yêu cầu Đặt Lại Mật Khẩu';
    await connection
      .createQueryBuilder()
      .insert()
      .into(Mail)
      .values({
        id: 1,
        mailTitle: mailTitleId1,
        mailText: mailTextId1,
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(Mail)
      .values({
        id: 2,
        mailTitle: mailTitleId2,
        mailText: mailTextId2,
      })
      .execute();
  }
}
