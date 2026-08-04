import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../../public");

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; //  10MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

function fileFilter(req, file, cb) {
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);

  if (file.fieldname === "videoFile") {
    if (!isVideo) {
      return cb(
        new Error(`Invalid video format. Allowed: MP4, WebM, OGG, MOV, AVI`),
        false,
      );
    }
  } else if (
    file.fieldname === "thumbnail" ||
    file.fieldname === "avatar" ||
    file.fieldname === "cover"
  ) {
    if (!isImage) {
      return cb(
        new Error(`Invalid image format. Allowed: JPG, PNG, WebP, GIF`),
        false,
      );
    }
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // 100MB cap — applies per file
    files: 5, // max 5 files per request
  },
});

// Multer error handler middleware — converts MulterError to JSON response
export function handleMulterError(err, req, res, next) {
  if (err && err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        statusCode: 400,
        message:
          "File is too large. Maximum allowed size is 100MB for videos and 10MB for images.",
        success: false,
      });
    }
    return res
      .status(400)
      .json({ statusCode: 400, message: err.message, success: false });
  }
  if (err) {
    return res
      .status(400)
      .json({ statusCode: 400, message: err.message, success: false });
  }
  next();
}
