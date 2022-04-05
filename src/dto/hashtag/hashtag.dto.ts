import { PostOutput } from '@dto/post/post-new.dto';
import { PaginationRes } from '@util/types';

export class HashtagOutput {
  popular: number;
  hashtag: string;
}
export class HashtagDetailDto extends HashtagOutput {
  posts: PaginationRes<PostOutput>;
}
