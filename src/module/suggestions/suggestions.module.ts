import { Suggestion, SuggestionSchema } from '@entity/suggestion.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Suggestion.name,
        schema: SuggestionSchema,
      },
    ]),
  ],
  providers: [SuggestionsService],
  controllers: [SuggestionsController],
})
export class SuggestionsModule {}
