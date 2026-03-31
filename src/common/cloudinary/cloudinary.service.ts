import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'crew-track',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload result is undefined'));
          resolve(result);
        },
      );

  streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async uploadBase64(base64: string, folder: string = 'crew-track'): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return cloudinary.uploader.upload(base64, {
      folder,
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}
