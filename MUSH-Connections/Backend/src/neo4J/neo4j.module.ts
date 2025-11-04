import { Module } from '@nestjs/common';
import neo4j from 'neo4j-driver';

@Module({
  providers: [
    {
      provide: 'NEO4J_DRIVER',
      useFactory: () => {
        return neo4j.driver(
          'bolt://localhost:7687',
          neo4j.auth.basic('neo4j', 'tu_contraseña')
        );
      },
    },
  ],
  exports: ['NEO4J_DRIVER'],
})
export class Neo4jModule {}