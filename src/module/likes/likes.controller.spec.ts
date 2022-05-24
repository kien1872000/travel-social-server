import { LikeInput } from '@dto/like/like.dto';
import { LikeDocument } from '@entity/like.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayLoad } from '@util/types';
import { now, Types } from 'mongoose';
import { LikesController } from './controllers/likes.controller';
import { LikesService } from './providers/likes.service';
describe('LikesController', () => {
  let controller: LikesController;
  const mockJwtPayload: JwtPayLoad = {
    _id: Types.ObjectId('627a956a5b5f2717542cc46e'),
    isActive: true,
  };

  const mockLikeInput = { postId: '627a95785b5f2717542d2154' };
  const mockLike = {
    _id: Types.ObjectId('62809f51ca76f000207fa6d3'),
    user: mockJwtPayload._id,
    post: Types.ObjectId(mockLikeInput.postId),
    createdAt: new Date(),
  };
  const mockLikesService = {
    addLikeToPost: jest.fn().mockImplementation((user, post) => {
      return {
        _id: mockLike._id,
        user,
        post: Types.ObjectId(post),
        createdAt: mockLike.createdAt,
      };
    }),
    getLikesOfPost: jest
      .fn()
      .mockImplementation((userId, postId, page, perPage) => []),
    removeLike: jest.fn().mockImplementation((userId, postId) => {}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [LikesService],
    })
      .overrideProvider(LikesService)
      .useValue(mockLikesService)
      .compile();

    controller = module.get<LikesController>(LikesController);
  });

  it('calling method addLike', () => {
    expect(controller.addLike(mockJwtPayload, mockLikeInput)).toEqual({
      _id: expect.any(Types.ObjectId),
      ...mockLike,
    });
    expect(mockLikesService.addLikeToPost).toHaveBeenCalled();
  });
  it('calling method getLikesOfPost', () => {
    controller.getLikesOfPost(mockJwtPayload, mockLikeInput.postId, {
      page: 0,
      perPage: 1,
    });
    expect(mockLikesService.getLikesOfPost).toHaveBeenCalledWith(
      mockJwtPayload._id,
      mockLikeInput.postId,
      0,
      1,
    );
  });
  it('calling method removeLike', () => {
    controller.removeLike(mockJwtPayload, mockLikeInput);
    expect(mockLikesService.removeLike).toHaveBeenCalledWith(
      mockJwtPayload._id,
      mockLikeInput.postId,
    );
  });
});
