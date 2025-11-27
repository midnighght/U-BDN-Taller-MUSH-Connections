import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Driver } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
  constructor(
    @Inject('NEO4J_DRIVER') private readonly driver: Driver,
  ) {}

  async onModuleDestroy() {
    await this.driver.close();
  }


  async createOrUpdateUser(userId: string, username: string, userPhoto?: string) {
    const session = this.driver.session();
    try {
      
      await session.run(
        `
        MERGE (u:User {userId: $userId})
        SET u.username = $username,
            u.userPhoto = $userPhoto,
            u.updatedAt = timestamp()
        RETURN u
        `,
        { userId, username, userPhoto: userPhoto || '' }
      );

      console.log('Usuario sincronizado en Neo4j');
    } catch (error) {
      console.error('Error creando usuario en Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


  async deleteUser(userId: string) {
    const session = this.driver.session();
    try {
    
      
      await session.run(
        `
        MATCH (u:User {userId: $userId})
        DETACH DELETE u
        `,
        { userId }
      );

      console.log('Usuario eliminado de Neo4j');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


  async createFriendship(userId1: string, userId2: string) {
    const session = this.driver.session();
    try {
 
      
      await session.run(
        `
        MATCH (u1:User {userId: $userId1})
        MATCH (u2:User {userId: $userId2})
        MERGE (u1)-[r1:FRIENDS_WITH {since: timestamp()}]->(u2)
        MERGE (u2)-[r2:FRIENDS_WITH {since: timestamp()}]->(u1)
        RETURN r1, r2
        `,
        { userId1, userId2 }
      );

      console.log('Amistad creada en Neo4j');
    } catch (error) {
      console.error('Error creando amistad:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


  async removeFriendship(userId1: string, userId2: string) {
    const session = this.driver.session();
    try {
  
      
      await session.run(
        `
        MATCH (u1:User {userId: $userId1})-[r:FRIENDS_WITH]-(u2:User {userId: $userId2})
        DELETE r
        `,
        { userId1, userId2 }
      );

      console.log('Amistad eliminada de Neo4j');
    } catch (error) {
      console.error('Error eliminando amistad:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


  async createFriendRequest(requesterId: string, recipientId: string) {
    const session = this.driver.session();
    try {
      
      await session.run(
        `
        MATCH (requester:User {userId: $requesterId})
        MATCH (recipient:User {userId: $recipientId})
        MERGE (requester)-[r:REQUESTED {createdAt: timestamp()}]->(recipient)
        RETURN r
        `,
        { requesterId, recipientId }
      );

      console.log('Solicitud registrada en Neo4j');
    } catch (error) {
      console.error('Error creando solicitud:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


  async removeFriendRequest(requesterId: string, recipientId: string) {
    const session = this.driver.session();
    try {
      
      await session.run(
        `
        MATCH (requester:User {userId: $requesterId})-[r:REQUESTED]->(recipient:User {userId: $recipientId})
        DELETE r
        `,
        { requesterId, recipientId }
      );

      console.log('Solicitud eliminada de Neo4j');
    } catch (error) {
      console.error('Error eliminando solicitud:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async blockUser(blockerId: string, blockedId: string) {
    const session = this.driver.session();
    try {
      
      await session.run(
        `
        MATCH (blocker:User {userId: $blockerId})
        MATCH (blocked:User {userId: $blockedId})
        MERGE (blocker)-[r:BLOCKED {createdAt: timestamp()}]->(blocked)
        RETURN r
        `,
        { blockerId, blockedId }
      );

      console.log('Bloqueo registrado en Neo4j');
    } catch (error) {
      console.error('Error creando bloqueo:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const session = this.driver.session();
    try {
      
      await session.run(
        `
        MATCH (blocker:User {userId: $blockerId})-[r:BLOCKED]->(blocked:User {userId: $blockedId})
        DELETE r
        `,
        { blockerId, blockedId }
      );

      console.log('Bloqueo eliminado de Neo4j');
    } catch (error) {
      console.error('Error eliminando bloqueo:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getFriendSuggestions(userId: string, limit: number = 10) {
    const session = this.driver.session();
    try {
      
      const result = await session.run(
        `
        MATCH (me:User {userId: $userId})
        
        // Encontrar amigos de mis amigos
        MATCH (me)-[:FRIENDS_WITH]->(friend)-[:FRIENDS_WITH]->(suggestion)
        
        // Excluir: yo mismo, mis amigos actuales, solicitudes pendientes, bloqueados
        WHERE me <> suggestion
          AND NOT (me)-[:FRIENDS_WITH]-(suggestion)
          AND NOT (me)-[:REQUESTED]-(suggestion)
          AND NOT (suggestion)-[:REQUESTED]-(me)
          AND NOT (me)-[:BLOCKED]-(suggestion)
          AND NOT (suggestion)-[:BLOCKED]-(me)
        
        // Contar amigos mutuos
        WITH suggestion, COUNT(DISTINCT friend) as mutualFriends
        
        // Ordenar por más amigos en común
        ORDER BY mutualFriends DESC
        
        LIMIT toInteger($limit)
        
        RETURN suggestion.userId as userId, 
               suggestion.username as username,
               suggestion.userPhoto as userPhoto,
               mutualFriends
        `,
        { userId, limit } 
      );

      const suggestions = result.records.map(record => ({
        userId: record.get('userId'),
        username: record.get('username'),
        userPhoto: record.get('userPhoto'),
        mutualFriends: record.get('mutualFriends').toNumber(),
      }));

      console.log(`Encontradas ${suggestions.length} sugerencias`);
      return suggestions;
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async verifyConnection() {
    const session = this.driver.session();
    try {
      const result = await session.run('RETURN 1 as test');
      console.log('Neo4j conectado correctamente');
      return true;
    } catch (error) {
      console.error('Error conectando a Neo4j:', error);
      return false;
    } finally {
      await session.close();
    }
  }
}