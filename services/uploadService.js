const multer = require('multer');
const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const { s3Client } = require('../config/s3');

const MAX_FILE_SIZE = parseInt(
  process.env.MAX_FILE_SIZE || '5242880',
  10
);

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const AWS_BUCKET_NAME =
  process.env.AWS_BUCKET_NAME || 'pelayanan-desa-upload';

const AWS_REGION =
  process.env.AWS_REGION || 'ap-southeast-1';

const CLOUDFRONT_URL =
  process.env.CLOUDFRONT_URL || '';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }

    const error = new Error(
      'Tipe file tidak didukung. Hanya PDF dan gambar diperbolehkan.'
    );

    error.status = 400;

    return cb(error, false);
  },
});

async function uploadToS3(file) {
  if (!file) {
    return null;
  }

  const timestamp = Date.now();

  const safeName = file.originalname.replace(
    /[^a-zA-Z0-9.-]/g,
    '_'
  );

  const s3Key = `uploads/${timestamp}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: s3Key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  let fileUrl;

  if (CLOUDFRONT_URL) {
    fileUrl = `https://${CLOUDFRONT_URL}/${s3Key}`;
  } else {
    fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;
  }

  return {
    name: file.originalname,
    type: file.mimetype,
    url: fileUrl,
    s3Key,
  };
}

async function deleteFromS3(s3Key) {
  if (!s3Key) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: s3Key,
  });

  await s3Client.send(command);
}

function buildFileInfo(file) {
  if (!file) {
    return null;
  }

  return {
    name: file.originalname,
    type: file.mimetype,
    buffer: file.buffer,
  };
}

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3,
  buildFileInfo,
};