import Mail from 'src/mail/mail.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
export class EmailSeed implements Seeder {
  async run(factory: Factory, connection: Connection): Promise<void> {
    const mailTextId1 =
      '<p>Welcome to the HREA System, your account is: </p><strong>Username: </strong> ${username} <br><strong>Password: </strong> 123456789';
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
