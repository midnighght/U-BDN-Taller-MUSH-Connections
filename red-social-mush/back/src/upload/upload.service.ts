// Backend - upload.service.ts
import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'images');

 async saveImageBase64(base64String: string): Promise<string> {
  // Crear carpeta si no existe (solo esta línea extra)
  await mkdir(this.uploadPath, { recursive: true });
  
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
  
  if (!matches) {
    throw new Error('Formato Base64 inválido');
  }
  
  const imageType = matches[1];
  const imageData = matches[2];
  const fileName = `${uuidv4()}.${imageType}`;
  const fullPath = join(this.uploadPath, fileName);
  
  const buffer = Buffer.from(imageData, 'base64');
  await writeFile(fullPath, buffer);
  
  return `/uploads/images/${fileName}`;
}
async saveUserPhoto64(base64String: string): Promise<string> {
  // Crear carpeta si no existe (solo esta línea extra)
  await mkdir(this.uploadPath, { recursive: true });
  
  const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
  
  if (!matches) {
    throw new Error('Formato Base64 inválido');
  }
  
  const imageType = matches[1];
  const imageData = matches[2];
  const fileName = `${uuidv4()}.${imageType}`;
  const fullPath = join(this.uploadPath, fileName);
  
  const buffer = Buffer.from(imageData, 'base64');
  await writeFile(fullPath, buffer);
  
  return `/uploads/userPhotos/${fileName}`;
}
}