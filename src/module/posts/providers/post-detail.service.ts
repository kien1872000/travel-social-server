import { CommentsService } from '@comment/providers/comments.service';
import { PostDetail } from '@dto/post/post-detail.dto';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Injectable()
export class PostDetailService {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}
  public async getPostDetail(
    page: number,
    perPage: number,
    currentUser: string,
    postId: string,
    commentId?: string,
  ): Promise<PostDetail> {
    try {
      const [post, commentList] = await Promise.all([
        this.postsService.getPostById(postId, currentUser),
        this.commentsService.getComments(postId, commentId, page, perPage),
      ]);
      return {
        ...post,
        commentList: commentList,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
