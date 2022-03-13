import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/)) {
    req.fileValidationError = 'only image files allowed';
    return callback(null, false);
  }
  callback(null, true);
};

export const storage = diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadPath = './src/uploads/filestorage/';

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req: any, file: Express.Multer.File, cb: any) => {
    cb(null, generateFilename(file.originalname));
  },
});

export const imageOrVideoFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  if (
    !file.originalname.match(
      /\.(jpg|jpeg|png|gif|PNG|AVI|avi|flv|wmv|mp4|mov|webm)$/
    )
  ) {
    req.fileValidationError = 'only image or video files allowed';
    return callback(null, false);
  }
  callback(null, true);
};
function generateFilename(fileName: string) {
  return `${Date.now()}_${fileName}`;
}
