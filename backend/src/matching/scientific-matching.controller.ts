import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ScientificMatchingService } from './scientific-matching.service.js';

export class ScientificSearchDto {
  query: string;
  topK?: number;
}

@Controller('matches/scientific')
export class ScientificMatchingController {
  constructor(private readonly service: ScientificMatchingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async search(@Body() body: ScientificSearchDto) {
    return this.service.search(body.query, body.topK ?? 10);
  }
}
