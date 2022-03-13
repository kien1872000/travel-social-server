import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Mail } from 'src/util/enums';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async sendConfirmationEmail(
    email: string,
    activationCode: string,
    displayName: string,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add(Mail.Confirmation, {
        email,
        activationCode,
        displayName,
      });
      return true;
    } catch (error) {
      // this.logger.error(`Error queueing confirmation email to user ${user.email}`)
      return false;
    }
  }
  async sendPasswordResetEmail(
    email: string,
    token: string,
    displayName: string,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add(Mail.Resetpassword, {
        email,
        token,
        displayName,
      });
      return true;
    } catch (error) {
      // this.logger.error(`Error queueing confirmation email to user ${user.email}`)
      return false;
    }
  }
}
