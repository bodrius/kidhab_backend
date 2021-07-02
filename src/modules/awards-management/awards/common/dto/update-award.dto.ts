import { PartialType, InputType, OmitType } from '@nestjs/graphql';
import { CreateAwardRequestDto } from './create-award-request.dto';

@InputType({ isAbstract: true })
export class UpdateAwardGqlDto extends PartialType(
  OmitType(CreateAwardRequestDto, ['templateId'] as const),
) {}
