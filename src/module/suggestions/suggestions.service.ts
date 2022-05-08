import { CreateSuggestionDto } from '@dto/suggestion/create-suggestion.dto';
import { Suggestion, SuggestionDocument } from '@entity/suggestion.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(Suggestion.name)
    private readonly suggestionModel: Model<SuggestionDocument>,
  ) {}
  public async saveSuggestion(
    userId: string,
    createSuggestionDto: CreateSuggestionDto,
  ): Promise<void> {
    try {
      const newSuggestion: Partial<Suggestion> = {
        userId: Types.ObjectId(userId),
        ...createSuggestionDto,
      };
      await new this.suggestionModel(newSuggestion).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getSuggestion(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<SuggestionDocument>> {
    try {
      const query = this.suggestionModel
        .find({ userId: Types.ObjectId(userId) })
        .populate('userId', ['displayName', 'avatar'])
        .select('-__v');
      return await paginate(query, { page, perPage });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
