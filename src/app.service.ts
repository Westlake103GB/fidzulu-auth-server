import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the FidZulu Auth Service. Visit /api-docs for API documentation.';
  }
}
