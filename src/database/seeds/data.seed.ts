/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { RoleEntity } from 'src/modules/roles/roles.entity';
import { EventTypeEntity } from 'src/modules/event_types/event_types.entity';
export class DataSeed implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    const defaultPassword = '123456';
    const salt: string = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);

    // //Create role
    const managerRole = await connection
      .createQueryBuilder()
      .insert()
      .into(RoleEntity)
      .values({
        roleName: 'Quản Lý',
      })
      .execute();
    const staffRole = await connection
      .createQueryBuilder()
      .insert()
      .into(RoleEntity)
      .values({
        roleName: 'Trưởng Nhóm',
      })
      .execute();
    const employeeRole = await connection
      .createQueryBuilder()
      .insert()
      .into(RoleEntity)
      .values({
        roleName: 'Nhân Viên',
      })
      .execute();

    //Create division
    const divison1 = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values({
        divisionName: 'Nhóm Hậu Cần',
        description: 'Hậu cần',
      })
      .execute();
    const divison2 = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values({
        divisionName: 'Nhóm Thiết kế',
        description: 'Test desc',
      })
      .execute();
    const divison3 = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values({
        divisionName: 'Nhóm kế hoạch',
        description: 'Test desc',
      })
      .execute();

    //Create user
    const manager1 = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: 'huydoanmec@gmail.com',
        password: hashPassword,
        role: {
          id: managerRole['identifiers'][0]['id'],
        },
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: 'Doan Vu Quang Huy',
        profileId: manager1['identifiers'][0]['id'],
        dob: faker.date.anytime(),
        nationalId: faker.random.numeric(12).toString(),
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      })
      .execute();

    const manager2 = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: 'tungnt16092001@gmail.com',
        password: hashPassword,
        role: {
          id: managerRole['identifiers'][0]['id'],
        },
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: 'Nguyen Thanh Tung',
        profileId: manager2['identifiers'][0]['id'],
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
        email: 'ema_staff@gmail.com',
        password: hashPassword,
        division: {
          id: divison2['identifiers'][0]['id'],
        },
        role: {
          id: staffRole['identifiers'][0]['id'],
        },
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: `Truong nhom ${divison1['identifiers'][0]['divisionName']}`,
        profileId: staff['identifiers'][0]['id'],
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
        email: 'ema_employee@gmail.com',
        password: hashPassword,
        division: {
          id: divison3['identifiers'][0]['id'],
        },
        role: {
          id: employeeRole['identifiers'][0]['id'],
        },
      })
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values({
        fullName: 'Nhan vien',
        profileId: employee['identifiers'][0]['id'],
        dob: faker.date.anytime(),
        nationalId: faker.random.numeric(12).toString(),
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      })
      .execute();

    //Create type of event
    const eventType1 = await connection
      .createQueryBuilder()
      .insert()
      .into(EventTypeEntity)
      .values({
        typeName: 'Sự kiện ra mắt sản phẩm mới, giới thiệu dịch vụ',
      })
      .execute();

    const eventType2 = await connection
      .createQueryBuilder()
      .insert()
      .into(EventTypeEntity)
      .values({
        typeName: 'Sự kiện họp báo, các hoạt động thông cáo báo chí',
      })
      .execute();

    const eventType3 = await connection
      .createQueryBuilder()
      .insert()
      .into(EventTypeEntity)
      .values({
        typeName: 'Sự kiện khai trương/khánh thành',
      })
      .execute();
    const eventType4 = await connection
      .createQueryBuilder()
      .insert()
      .into(EventTypeEntity)
      .values({
        typeName: 'Sự kiện gây quỹ',
      })
      .execute();

    // for (let index = 0; index < 10; index++) {
    //   await connection
    //     .createQueryBuilder()
    //     .insert()
    //     .into(EventEntity)
    //     .values({
    //       eventName: `Test name event ${index + 1}`,
    //       startDate: faker.date.anytime(),
    //       endDate: faker.date.anytime(),
    //       location: 'Quan 12',
    //       description: faker.lorem.paragraph(),
    //       coverUrl: faker.image.avatar(),
    //       estBudget: Number(
    //         faker.commerce.price({ min: 1000000, max: 200000000 }),
    //       ),
    //       status: EEventStatus.PROCESSING,
    //       // createdAt: faker.date.anytime(),
    //       // updatedAt: faker.date.anytime(),
    //     })
    //     .execute();
    // }
    // const mailTextId1 =
    //   '<p>Welcome to the HREA System, your account is: </p><strong>Email: </strong> ${email} <br><strong>Password: </strong> ${password}';
    // const mailTitleId1 = 'Chào mừng tới hệ thống HREA';
    // const mailTextId2 =
    //   '<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;"> <h2>Xác Nhận Mã</h2> <p>Xin chào,</p> <p>Dưới đây là mã xác nhận của tên đăng nhập ${email}:</p> <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3> <p>Vui lòng sử dụng mã này để hoàn tất quá trình xác thực.</p> <p>Lưu ý mã này chỉ có thời hạn 10 phút.</p> <p>Trân trọng,</p> <p>Đội ngũ hỗ trợ của chúng tôi( HREA System)</p> </div>';
    // const mailTitleId2 = 'Yêu cầu Đặt Lại Mật Khẩu';
    // await connection
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Mail)
    //   .values({
    //     id: 1,
    //     mailTitle: mailTitleId1,
    //     mailText: mailTextId1,
    //   })
    //   .execute();
    // await connection
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Mail)
    //   .values({
    //     id: 2,
    //     mailTitle: mailTitleId2,
    //     mailText: mailTextId2,
    //   })
    //   .execute();
  }
}
