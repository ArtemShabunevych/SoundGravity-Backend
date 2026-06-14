import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImageBase64(
    base64String: string | undefined,
  ): Promise<UploadApiResponse> {
    return await cloudinary.uploader.upload(<string>base64String, {
      colors: true,
      folder: 'soundgravity/covers',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });
  }

  async uploadAudioStream(fileBuffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'soundgravity/audio',
          resource_type: 'video',
        },
        (error, result) => {
          if (error) return reject(error);

          if (!result) {
            return reject(new Error('Cloudinary не повернув результат завантаження'));
          }

          resolve(result);
        },
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
  async uploadAvatarBase64(
    base64String: string | undefined,
  ): Promise<UploadApiResponse> {
    return await cloudinary.uploader.upload(<string>base64String, {
      folder: 'soundgravity/avatars',
      transformation: [
        {
          width: 150,
          height: 150,
          crop: 'fill',
          gravity: 'face'
        }
      ],
    });
  }
}