import { Like } from '@entity/like.entity';
import { Post } from '@entity/post.entity';
import { FollowingsService } from '@following/providers/followings.service';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';


import { LikesService } from './providers/likes.service';
describe('LikesService', () => {
  let service: LikesService;
  const mockLikeModel = {};
  const mockFollowingsService = {};
  const mockPostModel = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        { provide: getModelToken(Like.name), useValue: mockLikeModel },
        { provide: getModelToken(Post.name), useValue: mockPostModel },
        { provide: FollowingsService, useValue: mockFollowingsService },
      ],
    }).compile();
    service = module.get<LikesService>(LikesService);
  });

  it('should create a like of post', () => {});
  expect(service).toBeDefined();
});
