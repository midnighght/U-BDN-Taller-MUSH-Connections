import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RequestDocument = Request & Document;

export enum RequestType {
  FRIEND_REQUEST = 'friend_request',
  COMMUNITY_JOIN = 'community_join',
  COMMUNITY_INVITE = 'community_invite',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Request {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterID: Types.ObjectId; // Quien hace la solicitud

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  recipientID?: Types.ObjectId; // Para amistades (usuario individual)

  @Prop({ type: Types.ObjectId, ref: 'Community', required: false })
  communityID?: Types.ObjectId; // Para solicitudes de comunidad

  @Prop({ 
    type: String, 
    enum: Object.values(RequestType), 
    required: true 
  })
  type: RequestType;

  @Prop({ 
    type: String, 
    enum: Object.values(RequestStatus), 
    default: RequestStatus.PENDING 
  })
  status: RequestStatus;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Info adicional (ej: mensaje, rol solicitado)

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

// Índices para búsquedas eficientes
RequestSchema.index({ requesterID: 1, status: 1 });
RequestSchema.index({ recipientID: 1, status: 1 });
RequestSchema.index({ communityID: 1, status: 1 });
RequestSchema.index({ type: 1, status: 1 });