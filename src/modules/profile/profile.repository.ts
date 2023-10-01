import { CustomRepository } from 'src/type-orm/typeorm-ex.decorator';
import { ProfileEntity } from './profile.entity';
import { Repository } from 'typeorm';

@CustomRepository(ProfileEntity)
export default class ProfileRepository extends Repository<ProfileEntity> {}
