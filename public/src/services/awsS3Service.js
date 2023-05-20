"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Request = void 0;
/* import { S3Client } from '@aws-sdk/client-s3' */
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MY_AWS_ACCESS_KEY_ID = 'AKIASXMGBSOAZQXCS3GM'; //process.env.MY_AWS_ACCESS_KEY_ID
const MY_AWS_SECRET_ACCESS_KEY = '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'; //process.env.MY_AWS_SECRET_ACCESS_KEY
const MY_AWS_S3_BUCKET = 'anime-app'; //process.env.MY_AWS_S3_BUCKET
const MY_AWS_S3_REGION = 'us-east-1'; //process.env.MY_AWS_S3_REGION
async function s3Request({ operation, fileName, fileBuffer }) {
    if (operation === 'putObject') {
        return s3PutOperation({ fileName, fileBuffer: fileBuffer });
    }
    if (operation === 'getObject') {
        return s3GetOperation({ fileName });
    }
    return undefined;
}
exports.s3Request = s3Request;
async function s3PutOperation({ fileName, fileBuffer }) {
    /* const command = new PutObjectCommand({
      Bucket: MY_AWS_S3_BUCKET,
      Key: fileName,
      Body: fileBuffer,
      ContentLength: fileBuffer.length,
    })
  
    await client.send(command)
    return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}` */
    const blob = new Blob([fileBuffer]);
    const request = new Request(`https://s3.amazonaws.com/${MY_AWS_S3_BUCKET}/${fileName}`, {
        method: 'PUT',
        body: blob,
        headers: {
            Authorization: `Bearer ${MY_AWS_ACCESS_KEY_ID}:${MY_AWS_SECRET_ACCESS_KEY}`,
        },
    });
    const response = await fetch(request);
    console.log(response);
    return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`;
}
async function s3GetOperation({ fileName }) {
    /* const command = new HeadObjectCommand({
      Bucket: MY_AWS_S3_BUCKET!,
      Key: fileName,
    })
  
    try {
      await client.send(command)
      return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`
    } catch (error) {
      return
    } */
    const request = new Request(`https://s3.amazonaws.com/${MY_AWS_S3_BUCKET}/${fileName}`, {
        method: 'HEAD',
    });
    return fetch(request)
        .then(response => {
        console.log(response);
        return `https://${MY_AWS_S3_BUCKET}.s3.${MY_AWS_S3_REGION}.amazonaws.com/${fileName}`;
    })
        .catch(error => {
        return undefined;
    });
}
