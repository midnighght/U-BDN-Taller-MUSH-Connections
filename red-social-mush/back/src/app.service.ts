import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
    // aqui deberiia de usarse la base de datos
    
  }
}
