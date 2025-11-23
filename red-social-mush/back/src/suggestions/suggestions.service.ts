// suggestions/suggestions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Neo4jService } from 'src/neo4j/neo4j.service';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private neo4jService: Neo4jService,
  ) {}

  /**
   * Obtener sugerencias de amigos para un usuario
   */
  async getFriendSuggestions(userId: string, limit: number = 10) {
    console.log('💡 Obteniendo sugerencias para:', userId);

    try {
      // ✅ Obtener sugerencias de Neo4j
      const neo4jSuggestions = await this.neo4jService.getFriendSuggestions(
        userId,
        limit,
      );

      if (neo4jSuggestions.length === 0) {
        console.log('⚠️ No se encontraron sugerencias en Neo4j');
        return [];
      }

      // ✅ Enriquecer con datos de MongoDB
      const userIds = neo4jSuggestions.map((s) => s.userId);

      const users = await this.userModel
        .find({ _id: { $in: userIds } })
        .select('_id username userPhoto description')
        .lean()
        .exec();

      // ✅ Crear un mapa para búsqueda rápida
      const userMap = new Map(users.map((u) => [u._id.toString(), u]));

      // ✅ Combinar datos de Neo4j con MongoDB
      const enrichedSuggestions = neo4jSuggestions
        .map((suggestion) => {
          const userData = userMap.get(suggestion.userId);
          if (!userData) return null;

          return {
            _id: userData._id,
            username: userData.username,
            userPhoto: userData.userPhoto || '',
            bio: userData.description || '',
            mutualFriends: suggestion.mutualFriends,
          };
        })
        .filter((s) => s !== null);

      console.log(
        `✅ Devolviendo ${enrichedSuggestions.length} sugerencias enriquecidas`,
      );
      return enrichedSuggestions;
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error);
      throw error;
    }
  }
}
