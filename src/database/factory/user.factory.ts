import { faker } from '@faker-js/faker';
import { UserEntity } from 'src/modules/user/user.entity';
import { define } from 'typeorm-seeding';

define(UserEntity, () => {
  const account = new UserEntity();
  
  account.email = faker.internet.email();
  account.password = '123';
  return account;
});
