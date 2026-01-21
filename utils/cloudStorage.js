// utils/cloudStorage.js
const fs = require("fs");
const path = require("path");

class CloudStorage {
  constructor() {
    // Check which cloud storage is configured
    this.storageType = "local"; // default

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.storageType = "s3";
      const {
        S3Client,
        PutObjectCommand,
        GetObjectCommand,
        DeleteObjectCommand,
      } = require("@aws-sdk/client-s3");
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName =
        process.env.AWS_S3_BUCKET || "kannada-speech-audio-uploads";
      console.log("✅ Using AWS S3 for cloud storage");
    } else if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      this.storageType = "azure";
      const { BlobServiceClient } = require("@azure/storage-blob");
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
      );
      this.containerName =
        process.env.AZURE_STORAGE_CONTAINER_NAME || "audio-uploads";
      console.log("✅ Using Azure Blob Storage for cloud storage");
    } else {
      // Fallback to local storage
      this.localUploadDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
      console.log("⚠️  Using local storage (no cloud credentials found)");
    }

    this.useCloud = this.storageType !== "local";
  }

  async uploadFile(buffer, filename) {
    if (this.storageType === "s3") {
      // Upload to AWS S3
      const { PutObjectCommand } = require("@aws-sdk/client-s3");
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: this.getContentType(filename),
      });

      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${filename}`;
    } else if (this.storageType === "azure") {
      // Upload to Azure Blob Storage
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      await containerClient.createIfNotExists({ access: "blob" });

      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.upload(buffer, buffer.length);

      return blockBlobClient.url;
    } else {
      // Save to local storage
      const filePath = path.join(this.localUploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${filename}`;
    }
  }

  async downloadFile(filename) {
    if (this.storageType === "s3") {
      // Download from AWS S3
      const { GetObjectCommand } = require("@aws-sdk/client-s3");
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      });

      const response = await this.s3Client.send(command);
      return await this.streamToBuffer(response.Body);
    } else if (this.storageType === "azure") {
      // Download from Azure Blob Storage
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      const blockBlobClient = containerClient.getBlockBlobClient(filename);

      const downloadResponse = await blockBlobClient.download();
      return await this.streamToBuffer(downloadResponse.readableStreamBody);
    } else {
      // Read from local storage
      const filePath = path.join(this.localUploadDir, filename);
      return fs.readFileSync(filePath);
    }
  }

  async deleteFile(filename) {
    if (this.storageType === "s3") {
      // Delete from AWS S3
      const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      });

      await this.s3Client.send(command);
    } else if (this.storageType === "azure") {
      // Delete from Azure Blob Storage
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.deleteIfExists();
    } else {
      // Delete from local storage
      const filePath = path.join(this.localUploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".mp4": "video/mp4",
    };
    return types[ext] || "application/octet-stream";
  }

  async streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on("error", reject);
    });
  }
}

module.exports = new CloudStorage();
