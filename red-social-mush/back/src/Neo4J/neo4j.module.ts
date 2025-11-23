import { Module } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { Neo4jService } from './neo4j.service';

@Module({
  providers: [
    {
      provide: 'NEO4J_DRIVER',
      useFactory: () => {
        // Usar variables de entorno con fallback para desarrollo local
        const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
        const username = process.env.NEO4J_USERNAME || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || 'password1234';

        console.log(`🔗 Conectando a Neo4j en: ${uri}`);

        return neo4j.driver(
          uri,
          neo4j.auth.basic(username, password)
        );
      },
    },
    Neo4jService,
  ],
  exports: ['NEO4J_DRIVER', Neo4jService],
})
export class Neo4jModule {}