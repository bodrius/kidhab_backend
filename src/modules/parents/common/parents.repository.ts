import { DeepPartial, EntityRepository, Repository } from 'typeorm';
import { ParentEntity } from './parent.entity';

@EntityRepository(ParentEntity)
export class ParentsRepository extends Repository<ParentEntity> {
  async upsert(
    email: string,
    parentFields: DeepPartial<ParentEntity>,
  ): Promise<ParentEntity> {
    await this.createQueryBuilder()
      .insert()
      .values({ ...parentFields, email })
      .onConflict(`("email") DO NOTHING`)
      .execute();

    return this.findOne({ email });
  }
}
