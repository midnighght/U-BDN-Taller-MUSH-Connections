import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, username: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🍄 Verifica tu cuenta de MUSH',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #FFF8F5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 48px; font-weight: bold; color: #F45C1C; margin-bottom: 10px; }
            .title { font-size: 24px; color: #B24700; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background: linear-gradient(to right, #F45C1C, #FF8C42); color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MUSH 🍄</div>
              <div class="title">¡Bienvenido, ${username}!</div>
            </div>
            
            <div class="content">
              <p>Gracias por registrarte en MUSH, la red social más divertida.</p>
              <p>Para completar tu registro y comenzar a compartir con la comunidad, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
            </div>
            
            <div class="content">
              <p style="font-size: 14px; color: #999;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
              </p>
              <p style="word-break: break-all; color: #F45C1C; font-size: 12px;">
                ${verificationUrl}
              </p>
            </div>
            
            <div class="footer">
              <p>Este enlace expirará en 24 horas.</p>
              <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de verificación enviado a:', email);
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw new Error('No se pudo enviar el email de verificación');
    }
  }

  async sendWelcomeEmail(email: string, username: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎉 ¡Cuenta verificada! Bienvenido a MUSH',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #FFF8F5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; text-align: center; }
            .logo { font-size: 48px; font-weight: bold; color: #F45C1C; margin-bottom: 20px; }
            .title { font-size: 28px; color: #B24700; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎉 MUSH 🍄</div>
            <div class="title">¡Tu cuenta está verificada!</div>
            <div class="content">
              <p>Hola ${username},</p>
              <p>Tu cuenta ha sido verificada exitosamente. Ya puedes disfrutar de todas las funciones de MUSH.</p>
              <p>¡Comienza a compartir momentos increíbles con la comunidad!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de bienvenida enviado a:', email);
    } catch (error) {
      console.error('❌ Error al enviar email de bienvenida:', error);
    }
  }
}