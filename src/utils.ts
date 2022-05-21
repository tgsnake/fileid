// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2022 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

export enum FileType {
  THUMBNAIL = 0,
  CHAT_PHOTO = 1, // ProfilePhoto
  PHOTO = 2,
  VOICE = 3, // VoiceNote
  VIDEO = 4,
  DOCUMENT = 5,
  ENCRYPTED = 6,
  TEMP = 7,
  STICKER = 8,
  AUDIO = 9,
  ANIMATION = 10,
  ENCRYPTED_THUMBNAIL = 11,
  WALLPAPER = 12,
  VIDEO_NOTE = 13,
  SECURE_RAW = 14,
  SECURE = 15,
  BACKGROUND = 16,
  DOCUMENT_AS_FILE = 17,
  // InternalOnly! Don't pass with this!!
  WEB_LOCATION_FLAG = 1 << 24,
  FILE_REFERENCE_FLAG = 1 << 25,
}
export enum ThumbnailSource {
  LEGACY = 0,
  THUMBNAIL = 1,
  CHAT_PHOTO_SMALL = 2, // DialogPhotoSmall
  CHAT_PHOTO_BIG = 3, // DialogPhotoBig
  STICKER_SET_THUMBNAIL = 4,
}
export enum FileTypeUniqueId {
  WEB = 0,
  PHOTO = 1,
  DOCUMENT = 2,
  SECURE = 3,
  ENCRYPTED = 4,
  TEMP = 5,
}
export const PHOTO_TYPES = [
  FileType.THUMBNAIL,
  FileType.CHAT_PHOTO,
  FileType.PHOTO,
  FileType.WALLPAPER,
  FileType.ENCRYPTED_THUMBNAIL,
];
export function base64_url_encode(base: string | Buffer): string {
  return typeof base === 'string'
    ? Buffer.from(base).toString('base64url')
    : base.toString('base64url');
}
export function base64_url_decode(base: string | Buffer): Buffer {
  return typeof base === 'string' ? Buffer.from(base, 'base64url') : base;
}
export function rle_encode(base: string | Buffer): Buffer {
  let buffer: Buffer = typeof base === 'string' ? Buffer.from(base) : base;
  let r: Array<number> = [];
  let n: number = 0;
  for (let b of buffer) {
    if (!b) {
      n++;
    } else {
      if (n) {
        r.push(0, n);
        n = 0;
      }
      r.push(b);
    }
  }
  if (n) {
    r.push(0, n);
  }
  return Buffer.from(r);
}
export function rle_decode(base: string | Buffer): Buffer {
  let buffer: Buffer = typeof base === 'string' ? Buffer.from(base) : base;
  let r: Array<number> = [];
  let z: boolean = false;
  for (let b of buffer) {
    if (!b) {
      z = true;
      continue;
    }
    if (z) {
      for (let i = 0; i < b; i++) {
        r.push(0);
      }
      z = false;
    } else {
      r.push(b);
    }
  }
  return Buffer.from(r);
}
export class Writer {
  private buffer!: Buffer;
  private start!: number;
  private cur!: number;
  constructor(alloc: number) {
    this.buffer = Buffer.alloc(alloc);
    this.start = 0;
    this.cur = this.start;
  }
  writeInt(int: number): Writer {
    this.buffer.writeInt32LE(int, this.cur);
    this.cur += 4;
    return this;
  }
  writeBigInt(int: bigint): Writer {
    if (int < BigInt(0)) {
      this.buffer.writeBigInt64LE(int, this.cur);
    } else {
      this.buffer.writeBigUInt64LE(int, this.cur);
    }
    this.cur += 8;
    return this;
  }
  writeString(str: string): Writer {
    return this.writeBuffer(Buffer.from(str, 'utf8'));
  }
  writeBuffer(buffer: Buffer): Writer {
    const length = buffer.length;
    let padding;
    if (length <= 253) {
      this.buffer[this.cur++] = buffer.length;
      padding = (length + 1) % 4;
    } else {
      this.buffer[this.cur++] = 254;
      this.buffer[this.cur++] = buffer.length & 0xff;
      this.buffer[this.cur++] = (buffer.length >> 8) & 0xff;
      this.buffer[this.cur++] = (buffer.length >> 16) & 0xff;
      padding = length % 4;
    }
    buffer.copy(this.buffer, this.cur);
    this.cur += buffer.length;
    if (padding > 0) {
      padding = 4 - padding;
      while (padding--) this.buffer[this.cur++] = 0;
    }
    return this;
  }
  results(): Buffer {
    return this.buffer.slice(0, this.cur);
  }
}
export class Reader {
  private buffer!: Buffer;
  private start!: number;
  private cur!: number;
  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.start = 0;
    this.cur = this.start;
  }
  readInt(): number {
    const res = this.buffer.readInt32LE(this.cur);
    this.cur += 4;
    return res;
  }
  readBigInt(): bigint {
    let res = BigInt(0);
    try {
      res = this.buffer.readBigUInt64LE(this.cur);
    } catch (error) {
      res = this.buffer.readBigInt64LE(this.cur);
    }
    this.cur += 8;
    return res;
  }
  readString(): string {
    return this.readBuffer().toString('utf8');
  }
  readBuffer(): Buffer {
    const firstBuff = this.buffer[this.cur++];
    let length, padding;
    if (firstBuff === 254) {
      length =
        this.buffer[this.cur++] | (this.buffer[this.cur++] << 8) | (this.buffer[this.cur++] << 16);
      padding = length % 4;
    } else {
      length = firstBuff;
      padding = (length + 1) % 4;
    }
    const data = this.buffer.slice(
      this.cur,
      (this.cur += length === -1 ? this.buffer.length - this.cur : length)
    );
    if (padding > 0) this.cur += 4 - padding;
    return data;
  }
}
