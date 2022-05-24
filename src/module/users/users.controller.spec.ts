import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayLoad } from '@util/types';
import { Types } from 'mongoose';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './providers/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const mockJwtPayload: JwtPayLoad = {
    _id: Types.ObjectId('627a956a5b5f2717542cc46e'),
    isActive: true,
  };

  const mockUsersService = {
    getUserProfile: jest.fn().mockImplementation((currentUser, userId?) => {
      return {};
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('calling method getUserProfile with userId', () => {
    controller.getUserProfile(mockJwtPayload, 'id');
    expect(mockUsersService.getUserProfile).toHaveBeenCalledWith(
      mockJwtPayload._id,
      'id',
    );
  });
  it('calling method getUserProfile without userId', () => {
    controller.getUserProfile(mockJwtPayload, undefined);
    expect(mockUsersService.getUserProfile).toHaveBeenCalledWith(
      mockJwtPayload._id,
      mockJwtPayload._id.toString(),
    );
  });
});
