import {
  ConnectedSocket,
  ConnectedSocketDocument,
} from '@entity/connected-socket.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ConnectedSocketsService {
  constructor(
    @InjectModel(ConnectedSocket.name)
    private readonly socketModel: Model<ConnectedSocketDocument>,
  ) {}
  public async saveSocket(socketId: string, userId: string): Promise<void> {
    try {
      const socket: Partial<ConnectedSocketDocument> = {
        socketId: socketId,
        user: Types.ObjectId(userId),
      };
      await new this.socketModel(socket).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async deleteSocket(socketId: string): Promise<void> {
    try {
      await this.socketModel.findOneAndDelete({ socketId: socketId });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getSocketId(userId: string): Promise<string> {
    try {
      const socket = await this.socketModel.findOne({
        user: Types.ObjectId(userId),
      });
      return socket?.socketId;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getSocketBySocketId(
    socketId: string,
  ): Promise<ConnectedSocketDocument> {
    try {
      return await this.socketModel
        .findOne({
          socketId: socketId,
        })
        .populate('user', ['displayName', 'avatar']);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
