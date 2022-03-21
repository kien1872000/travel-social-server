import { UserCommentDto } from '@dto/comment/user-comment.dto';
import { PaginationRes } from '@util/types';
import { PostOutput } from './post-new.dto';

export class PostDetail extends PostOutput {
  commentList: PaginationRes<UserCommentDto>;
}
