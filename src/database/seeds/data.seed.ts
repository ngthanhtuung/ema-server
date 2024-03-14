/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { ProfileEntity } from 'src/modules/profile/profile.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as bcrypt from 'bcrypt';
import { EGender, ERole, ETypeEmployee } from 'src/common/enum/enum';
import { DivisionEntity } from 'src/modules/division/division.entity';
import { EventEntity } from 'src/modules/event/event.entity';
import Mail from 'src/modules/mail/mail.entity';
import { RoleEntity } from 'src/modules/roles/roles.entity';
import { EventTypeEntity } from 'src/modules/event_types/event_types.entity';
import * as moment from 'moment-timezone';
import { CategoryEntity } from '../../modules/categories/categories.entity';

const maleFirstName = [
  'An',
  'Bình',
  'Chiến',
  'Dũng',
  'Duy',
  'Giang',
  'Hải',
  'Hùng',
  'Kiên',
  'Long',
  'Minh',
  'Nam',
  'Phong',
  'Quân',
  'Sơn',
  'Tài',
  'Tuấn',
  'Vinh',
  'Đức',
  'Thành',
];

const femaleFirstName = [
  'Anh',
  'Bích',
  'Cẩm',
  'Diễm',
  'Duyên',
  'Hà',
  'Hương',
  'Huyền',
  'Lan',
  'Linh',
  'Mai',
  'Ngân',
  'Oanh',
  'Phượng',
  'Quyên',
  'Thảo',
  'Trang',
  'Tuyết',
  'Vân',
  'Yến',
];

const lastName = [
  'Nguyễn',
  'Lê',
  'Trần',
  'Phạm',
  'Vũ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
  'Võ',
  'Trương',
  'Bành',
  'Đinh',
  'Lưu',
  'Phí',
  'Cù',
  'Hà',
];

const randomGender = () => {
  return Math.random() < 0.5 ? 'male' : 'female';
};

const randomFirstName = (gender) => {
  if (gender === 'male') {
    return maleFirstName[Math.floor(Math.random() * maleFirstName.length)];
  } else {
    return femaleFirstName[Math.floor(Math.random() * femaleFirstName.length)];
  }
};

const randomLastName = () => {
  return lastName[Math.floor(Math.random() * lastName.length)];
};

const randomFullName = () => {
  const gender = randomGender();
  const firstName = randomFirstName(gender);
  const lastName = randomLastName();
  return `${firstName} ${lastName}`;
};

export class DataSeed implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    const defaultPassword = '123456';
    const salt: string = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(defaultPassword, salt);
    // ================= List Data Role =================
    const listDataRole = [
      {
        roleName: 'Administrator',
      },
      {
        roleName: 'Trưởng Nhóm',
      },
      {
        roleName: 'Nhân Viên',
      },
      {
        roleName: 'Quản Lý',
      },
      {
        roleName: 'Khách Hàng',
      },
    ];
    const dataRole = await connection
      .createQueryBuilder()
      .insert()
      .into(RoleEntity)
      .values(listDataRole)
      .execute();
    console.log('dataRole:', dataRole);
    const findIdRole = async (role: ERole) => {
      const dataRole = await connection
        .createQueryBuilder(RoleEntity, 'roles')
        .where('roles.roleName = :roleName', {
          roleName: role,
        })
        .getOne();
      return dataRole;
    };

    // ================= List Data Division =================
    const listDataDivision = [
      {
        divisionName: 'Nhóm Hậu Cần',
        description:
          'Hỗ trợ logistics cho các sự kiện, bao gồm vận chuyển, sắp xếp địa điểm, và cung cấp vật tư',
      },
      {
        divisionName: 'Nhóm Thiết kế',
        description:
          'Thiết kế và phát triển các tài liệu quảng cáo cho các sự kiện, bao gồm logo, banner, và website.',
      },
      {
        divisionName: 'Nhóm kế hoạch',
        description: 'Lập kế hoạch và phát triển chiến lược cho các sự kiện',
      },
      {
        divisionName: 'Nhóm Marketing',
        description:
          'Có kinh nghiệm trong việc quảng bá và thu hút khách hàng tham dự sự kiện.',
      },
      {
        divisionName: 'Nhóm Bán hàng',
        description: 'Có chuyên môn về bán hàng và thuyết trình.',
      },
      {
        divisionName: 'Nhóm Kỹ thuật',
        description:
          'Hỗ trợ kỹ thuật cho các sự kiện, bao gồm âm thanh, ánh sáng, và video.',
      },
      {
        divisionName: 'Nhóm Tài chính',
        description:
          'Quản lý ngân sách cho các sự kiện.Theo dõi chi tiêu và thanh toán hóa đơn.',
      },
      {
        divisionName: 'Nhóm Dịch vụ khách hàng',
        description:
          'Quản lý ngân sách cho các sự kiện.Theo dõi chi tiêu và thanh toán hóa đơn.',
      },
    ];
    const dataDivision = await connection
      .createQueryBuilder()
      .insert()
      .into(DivisionEntity)
      .values(listDataDivision)
      .execute();

    // ================= List Data User =================
    const dataUser1 = [
      // =============================== Account Manager ===============================
      {
        email: 'huydoanmec@gmail.com',
        password: hashPassword,
        typeEmployee: ETypeEmployee.FULL_TIME,
        role: {
          id: (await findIdRole(ERole.MANAGER))?.id,
        },
      },
      // =============================== Account Admin ===============================
      {
        email: 'tungnt16092001@gmail.com',
        password: hashPassword,
        typeEmployee: ETypeEmployee.FULL_TIME,
        role: {
          id: (await findIdRole(ERole.ADMIN))?.id,
        },
      },
    ];
    const user1 = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values(dataUser1)
      .execute();
    const dataProfile1 = [
      {
        fullName: 'Đoàn Vũ Quang Huy',
        id: user1['identifiers'][0]['id'],
        dob: faker.date.anytime(),
        nationalId: faker.string.numeric(12).toString(),
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      },
      {
        fullName: 'Nguyễn Thanh Tùng',
        id: user1['identifiers'][1]['id'],
        dob: faker.date.anytime(),
        nationalId: faker.string.numeric(12).toString(),
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      },
    ];
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values(dataProfile1)
      .execute();
    const dataUser = [];
    const dataProfile = [];
    // =============================== Account Staff ===============================
    const createStafUser = async (index: number, email: string) => {
      const staffUser = {
        email,
        password: hashPassword,
        typeEmployee: ETypeEmployee.FULL_TIME,
        division: {
          id: dataDivision['identifiers'][index]['id'],
        },
        role: {
          id: (await findIdRole(ERole.STAFF))?.id,
        },
        isStaff: true,
      };
      dataUser.push(staffUser);
    };

    for (let index = 0; index < 8; index++) {
      const email =
        index === 0 ? `banhquy.dev@gmail.com` : `ema_staff${index}@gmail.com`;
      await createStafUser(index, email);
    }
    // =============================== Account Employee ==============================
    let count = 8;
    const createEmployee = async (index1: number, email: string) => {
      const employee = {
        email,
        password: hashPassword,
        typeEmployee: ETypeEmployee.FULL_TIME,
        division: {
          id: dataDivision['identifiers'][index1]['id'],
        },
        role: {
          id: (await findIdRole(ERole.EMPLOYEE)).id,
        },
      };
      if (index1 % 2) {
        employee.typeEmployee = ETypeEmployee.PART_TIME;
      }
      dataUser.push(employee);
      count++;
    };
    for (let index1 = 0; index1 < 8; index1++) {
      for (let index2 = 0; index2 < 15; index2++) {
        const email =
          index2 === 0 && index1 === 0
            ? `vupro123kute@gmail.com`
            : `ema_employee${index1}_${index2}@gmail.com`;
        await createEmployee(index1, email);
      }
    }
    console.log('dataUser:', dataUser.length);
    const user = await connection
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values(dataUser)
      .execute();
    console.log('user:', user['identifiers'].length);

    // =============================================== Create Profile ===============================================
    // Staff
    const createStaffProfile = (index: number) => {
      const staffProfile = {
        fullName: randomFullName(),
        id: user['identifiers'][index]['id'],
        dob: faker.date.anytime(),
        nationalId: faker.string.numeric(12).toString(),
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      };

      dataProfile.push(staffProfile);
    };
    for (let index = 0; index < 8; index++) {
      createStaffProfile(index);
    }
    console.log('dataProfile:', dataProfile.length);

    // Employee
    let count2 = 8;
    const createEmployeeProfile = (index2: number) => {
      console.log('index2 + count2:', index2 + count2);

      const employeeProfile = {
        fullName: randomFullName(),
        id: user['identifiers']?.[index2 + count2]?.['id'],
        dob: faker.date.anytime(),
        nationalId: faker.string.numeric(12).toString(),
        gender: faker.person.sex().toUpperCase() as EGender,
        address: faker.location.street(),
        phoneNumber: faker.phone.number(),
        avatar: 'https://picsum.photos/200/300',
      };
      dataProfile.push(employeeProfile);
    };
    console.log('dataProfile 2:', dataProfile.length);
    for (let index1 = 0; index1 < 8; index1++) {
      for (let index2 = 0; index2 < 15; index2++) {
        createEmployeeProfile(index2);
      }
      count2 += 15;
    }
    console.log('dataProfile:', dataProfile);
    await connection
      .createQueryBuilder()
      .insert()
      .into(ProfileEntity)
      .values(dataProfile)
      .execute();
    const listEventType = [
      {
        typeName: 'Sự kiện ra mắt sản phẩm mới, giới thiệu dịch vụ',
      },
      {
        typeName: 'Sự kiện họp báo, các hoạt động thông cáo báo chí',
      },
      {
        typeName: 'Sự kiện khai trương/khánh thành',
      },
      {
        typeName: 'Sự kiện gây quỹ',
      },
      {
        typeName: 'Sự kiện tuyển dụng',
      },
      {
        typeName: 'Sự kiện team building',
      },
      {
        typeName: 'Sự kiện kỷ niệm công ty',
      },
      {
        typeName: 'Sự kiện tri ân khách hàng',
      },
      {
        typeName: 'Sự kiện đào tạo nội bộ',
      },
    ];
    const eventType = await connection
      .createQueryBuilder()
      .insert()
      .into(EventTypeEntity)
      .values(listEventType)
      .execute();
    const listEvent = [
      {
        eventName:
          'Sự kiện ra mắt và quảng bá ngành Công Nghệ Ô Tô, Đại Học FPT',
        startDate: moment().format('YYYY-MM-DD'),
        processingDate: moment().add(6, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(7, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://sukienachau.com/wp-content/uploads/2021/08/website-bigslide.jpg',
        location: 'Đại học FPT, Cơ sở Thành Phố Hồ Chí Minh',
        description:
          '[{"insert":"Hội thảo chuyên đề này sẽ tập trung vào việc chia sẻ những xu hướng mới nhất trong ngành quảng cáo và tiếp thị, giúp các doanh nghiệp cập nhật những chiến lược hiệu quả nhất để thu hút khách hàng tiềm năng và tăng doanh thu.\\n\\n Các chuyên gia hàng đầu trong ngành sẽ chia sẻ kiến thức và kinh nghiệm của họ về các chủ đề như quảng cáo kỹ thuật số, marketing nội dung, SEO, và mạng xã hội. \\n\\nHội thảo cũng sẽ cung cấp cho các doanh nghiệp cơ hội để giao lưu và học hỏi lẫn nhau.\\n"}]',
        estBudget: 100000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][0]['id'],
        },
      },
      {
        eventName:
          'Hội thảo chuyên đề: Xu hướng quảng cáo và tiếp thị trong năm 2024',
        startDate: moment().format('YYYY-MM-DD'),
        processingDate: moment().add(6, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(7, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://treobangron.com.vn/wp-content/uploads/2022/09/banner-khai-truong-31.jpg',
        location: 'Trung tâm Hội nghị Quốc tế, TP. Hồ Chí Minh',
        description:
          '[{"insert":"Hội thảo chuyên đề này sẽ tập trung vào việc chia sẻ những xu hướng mới nhất trong ngành quảng cáo và tiếp thị, giúp các doanh nghiệp cập nhật những chiến lược hiệu quả nhất để thu hút khách hàng tiềm năng và tăng doanh thu.\\n\\n Các chuyên gia hàng đầu trong ngành sẽ chia sẻ kiến thức và kinh nghiệm của họ về các chủ đề như quảng cáo kỹ thuật số, marketing nội dung, SEO, và mạng xã hội. \\n\\nHội thảo cũng sẽ cung cấp cho các doanh nghiệp cơ hội để giao lưu và học hỏi lẫn nhau.\\n"}]',
        estBudget: 200000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][1]['id'],
        },
      },
      {
        eventName: 'Khóa học: Kỹ năng viết content thu hút',
        startDate: moment().add(1, 'days').format('YYYY-MM-DD'),
        processingDate: moment().add(4, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(5, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1ME4Atqq5Ga7DGksE37o0DOsTVciHir29Vw&usqp=CAU',
        location: 'Trường Đại học Kinh tế TP. Hồ Chí Minh',
        description:
          '[{"insert":"Hội thảo chuyên đề này sẽ tập trung vào việc chia sẻ những xu hướng mới nhất trong ngành quảng cáo và tiếp thị, giúp các doanh nghiệp cập nhật những chiến lược hiệu quả nhất để thu hút khách hàng tiềm năng và tăng doanh thu.\\n\\n Các chuyên gia hàng đầu trong ngành sẽ chia sẻ kiến thức và kinh nghiệm của họ về các chủ đề như quảng cáo kỹ thuật số, marketing nội dung, SEO, và mạng xã hội. \\n\\nHội thảo cũng sẽ cung cấp cho các doanh nghiệp cơ hội để giao lưu và học hỏi lẫn nhau.\\n"}]',
        estBudget: 50000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][2]['id'],
        },
      },
      {
        eventName: 'Hội nghị thượng đỉnh marketing Việt Nam 2024',
        startDate: moment().add(7, 'days').format('YYYY-MM-DD'),
        processingDate: moment().add(13, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(14, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://thumbs.dreamstime.com/b/blue-golden-royal-awards-graphics-background-royal-awards-graphics-background-award-background-luxury-premium-graphics-blue-golden-268397993.jpg',
        location: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
        description:
          '[{"insert":"Hội nghị thượng đỉnh marketing Việt Nam 2024 là sự kiện lớn nhất dành cho các nhà marketing trong nước. Đây là nơi để các nhà marketing gặp gỡ, giao lưu và học hỏi lẫn nhau. Hội nghị cũng sẽ cung cấp cho các nhà marketing những thông tin cập nhật về những xu hướng mới nhất trong ngành và những chiến lược hiệu quả nhất để thu hút khách hàng tiềm năng và tăng doanh thu.\\n"}]',
        estBudget: 300000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][4]['id'],
        },
      },
      {
        eventName: 'Lễ trao giải Marketing Awards 2024',
        startDate: moment().add(5, 'days').format('YYYY-MM-DD'),
        processingDate: moment().add(8, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(9, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://www.shutterstock.com/shutterstock/photos/2167924209/display_1500/stock-vector-golden-blue-purple-award-background-jubilee-night-decorative-invitation-trophy-on-stage-platform-2167924209.jpg',
        location: 'Nhà hát Lớn, TP. Hồ Chí Minh',
        description:
          '[{"insert":"Lễ trao giải Marketing Awards 2024 là sự kiện nhằm tôn vinh những thành tựu xuất sắc trong ngành marketing. Các giải thưởng sẽ được trao cho các cá nhân và doanh nghiệp có những chiến dịch marketing hiệu quả nhất trong năm qua.\\n"}]',
        estBudget: 150000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][5]['id'],
        },
      },
      {
        eventName: 'Khóa học: SEO nâng cao',
        startDate: moment().add(5, 'days').format('YYYY-MM-DD'),
        processingDate: moment().add(8, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(9, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://img.freepik.com/premium-vector/red-orange-golden-award-background-elegant-looking-orange-premium-template_820621-109.jpg',
        location: 'Trung tâm Tin học, TP. Hồ Chí Minh',
        description:
          '[{"insert":"Khóa học này sẽ cung cấp cho bạn những kiến thức và kỹ năng nâng cao về SEO. Bạn sẽ học cách tối ưu hóa website của mình để thu hút nhiều khách hàng tiềm năng hơn từ Google và các công cụ tìm kiếm khác.\\n"}]',
        estBudget: 50000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][6]['id'],
        },
      },
      {
        eventName: 'Vui Lòng Điền Tên Event',
        startDate: moment().add(5, 'days').format('YYYY-MM-DD'),
        processingDate: moment().add(8, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(9, 'days').format('YYYY-MM-DD'),
        coverUrl:
          'https://img.freepik.com/premium-vector/red-orange-golden-award-background-elegant-looking-orange-premium-template_820621-109.jpg',
        location: 'Trung tâm Tin học, TP. Hồ Chí Minh',
        description:
          '[{"insert":"Khóa học này sẽ cung cấp cho bạn những kiến thức và kỹ năng nâng cao về SEO. Bạn sẽ học cách tối ưu hóa website của mình để thu hút nhiều khách hàng tiềm năng hơn từ Google và các công cụ tìm kiếm khác.\\n"}]',
        estBudget: 50000000,
        createdBy: user1['identifiers'][0]['id'],
        eventType: {
          id: eventType['identifiers'][6]['id'],
        },
        isTemplate: true,
      },
    ];

    const listCategories = [
      {
        categoryName: 'Địa điểm tổ chức',
      },
      {
        categoryName: 'Sản xuất chương trình',
      },
      {
        categoryName: 'Các hạng mục khác',
      },
    ];
    await connection
      .createQueryBuilder()
      .insert()
      .into(CategoryEntity)
      .values(listCategories)
      .execute();

    const event1 = await connection
      .createQueryBuilder()
      .insert()
      .into(EventEntity)
      .values(listEvent)
      .execute();
    const mailTextId1 =
      '<p>Ch&agrave;o mừng bạn đến với hệ thống EMA, dưới đ&acirc;y l&agrave; t&agrave;i khoản đăng nhập v&agrave;o hệ thống.</p>\n<table border="1" cellpadding="1" cellspacing="1" style="width:378px">\n\t<tbody>\n\t\t<tr>\n\t\t\t<td style="width:138px"><strong>Username/Email</strong></td>\n\t\t\t<td style="width:224px"><span style="color:#c0392b"><strong>${email}</strong></span></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style="width:138px"><strong>Password</strong></td>\n\t\t\t<td style="width:224px"><span style="color:#c0392b"><strong>${password}</strong></span></td>\n\t\t</tr>\n\t</tbody>\n</table>\n<p><strong>Lưu &yacute;:&nbsp;</strong>Khi đăng nhập lần đầu ti&ecirc;n v&agrave;o hệ thống, xin vui l&ograve;ng đổi mật khẩu.</p>\n<p>Đội ngũ hỗ trợ của ch&uacute;ng t&ocirc;i (EMA System).</p>\n<p>&nbsp;</p>';
    const mailTitleId1 = 'EMA - Tài khoản đăng nhập hệ thống';
    const mailTextId2 =
      '<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;"> <h2>Xác Nhận Mã</h2> <p>Xin chào,</p> <p>Dưới đây là mã xác nhận của tên đăng nhập ${email}:</p> <h3 style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${code}</h3> <p>Vui lòng sử dụng mã này để hoàn tất quá trình xác thực.</p> <p>Lưu ý mã này chỉ có thời hạn 10 phút.</p> <p>Trân trọng,</p> <p>Đội ngũ hỗ trợ của chúng tôi( HREA System)</p> </div>';
    const mailTitleId2 = 'Yêu cầu Đặt Lại Mật Khẩu';
    const mailTextId3 =
      '<p>Xin chào <strong style="box-sizing:border-box;">{customerName},</strong></p>\n' +
      '<p style="-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);box-sizing:border-box;color:rgb(0, 0, 0);counter-reset:list-1 0 list-2 0 list-3 0 list-4 0 list-5 0 list-6 0 list-7 0 list-8 0 list-9 0;cursor:text;font-family:arial;font-size:14px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:20px;margin-bottom:0px;margin-right:0px;margin-top:0px;orphans:2;padding:0px;text-align:left;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:pre-wrap;widows:2;word-spacing:0px;">Cảm ơn vì đã sử dụng dịch vụ của EMA, vui lòng <a target="_blank" rel="noopener noreferrer" href="{emailConfirm}">click tại đây</a> để xác nhận thông tin cuối cùng trước khi chúng tôi tạo hợp đồng và gửi đến bạn. <strong>(Lưu ý: đường dẫn chỉ có hiệu lực trong vòng 24h)</strong></p>\n' +
      '<p style="-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);box-sizing:border-box;color:rgb(0, 0, 0);counter-reset:list-1 0 list-2 0 list-3 0 list-4 0 list-5 0 list-6 0 list-7 0 list-8 0 list-9 0;cursor:text;font-family:arial;font-size:14px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:20px;margin:0px;orphans:2;padding:0px;text-align:left;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:pre-wrap;widows:2;word-spacing:0px;">&nbsp;</p>\n' +
      '<p style="-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);box-sizing:border-box;color:rgb(0, 0, 0);counter-reset:list-1 0 list-2 0 list-3 0 list-4 0 list-5 0 list-6 0 list-7 0 list-8 0 list-9 0;cursor:text;font-family:arial;font-size:14px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:20px;margin:0px;orphans:2;padding:0px;text-align:left;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:pre-wrap;widows:2;word-spacing:0px;">Sau khi gửi thông tin, bạn vui lòng chờ 5 phút hợp đồng sẽ được tự động tạo. Vui lòng đăng nhập vào hệ thống để kiếm tra hợp đồng được tạo.</p>\n' +
      '<p style="-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);box-sizing:border-box;color:rgb(0, 0, 0);counter-reset:list-1 0 list-2 0 list-3 0 list-4 0 list-5 0 list-6 0 list-7 0 list-8 0 list-9 0;cursor:text;font-family:arial;font-size:14px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:20px;margin:0px;orphans:2;padding:0px;text-align:left;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:pre-wrap;widows:2;word-spacing:0px;">&nbsp;</p>\n' +
      '<p style="-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);box-sizing:border-box;color:rgb(0, 0, 0);counter-reset:list-1 0 list-2 0 list-3 0 list-4 0 list-5 0 list-6 0 list-7 0 list-8 0 list-9 0;cursor:text;font-family:arial;font-size:14px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:20px;margin:0px;orphans:2;padding:0px;text-align:left;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:pre-wrap;widows:2;word-spacing:0px;">Mọi thắc mắc vui lòng liên hệ với người phụ trách theo thông tin sau:</p>\n' +
      '<ul>\n' +
      '    <li>Họ và Tên: <strong>{companyRepresentativeName}</strong></li>\n' +
      '    <li>Email: <strong>{companyRepresentativeEmail}</strong></li>\n' +
      '    <li>Số điện thoại: <strong>{companyRepresentativePhoneNumber}</strong></li>\n' +
      '</ul>\n' +
      '<p>Trân trọng!</p>';
    const mailTitleId3 = 'Xác nhận thông tin hợp đồng';
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
    await connection
      .createQueryBuilder()
      .insert()
      .into(Mail)
      .values({
        id: 3,
        mailTitle: mailTitleId3,
        mailText: mailTextId3,
      })
      .execute();
  }
}
