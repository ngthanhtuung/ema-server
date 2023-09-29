import { Controller } from '@nestjs/common';
import { CommentfileService } from './commentfile.service';

@Controller('commentfile')
export class CommentfileController {
  constructor(private readonly commentfileService: CommentfileService) {}
}
