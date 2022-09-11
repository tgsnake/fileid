/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2022 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import {
  FileType,
  ThumbnailSource,
  FileTypeUniqueId,
  base64_url_encode,
  rle_encode,
  Writer,
  Reader,
  PHOTO_TYPES,
  Options,
} from './';
import type { Decode } from './decode';

export class Encode {
  /**
   * Identifier for this file, which can be used to download or reuse the file
   */
  fileId!: string;
  /**
   * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file
   */
  fileUniqueId!: string;
  constructor({
    fileId,
    fileUniqueId,
  }: {
    /**
     * Identifier for this file, which can be used to download or reuse the file
     */
    fileId: string;
    /**
     * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file
     */
    fileUniqueId: string;
  }) {
    this.fileId = fileId;
    this.fileUniqueId = fileUniqueId;
  }
  static encode(file: Options | Decode): Encode {
    return new Encode({
      fileId: Encode.fileId(file),
      fileUniqueId: Encode.uniqueId(file),
    });
  }
  static fileId(file: Options | Decode): string {
    if (file.fileReference) {
      file.fileType |= FileType.FILE_REFERENCE_FLAG;
    }
    if (file.url) {
      file.fileType |= FileType.WEB_LOCATION_FLAG;
    }
    const writer = new Writer(file.url ? Buffer.byteLength(file.url!, 'utf8') + 32 : 100);
    writer.writeInt(Number(file.fileType)).writeInt(Number(file.dcId));
    if (file.url) {
      writer.writeString(file.url!);
    }
    if (file.fileReference) {
      writer.writeBuffer(file.fileReference!);
    }
    writer.writeBigInt(BigInt(String(file.id))).writeBigInt(BigInt(String(file.accessHash)));
    if (PHOTO_TYPES.includes(file.fileType)) {
      writer.writeBigInt(BigInt(String(file.volumeId)));
      if (file.version >= 4) writer.writeInt(Number(file.thumbnailSource));
      switch (file.thumbnailSource) {
        case ThumbnailSource.LEGACY:
          writer.writeBigInt(BigInt(String(file.secret))).writeInt(Number(file.localId));
        case ThumbnailSource.THUMBNAIL:
          writer
            .writeInt(Number(file.thumbnailFileType))
            .writeInt(String(file.thumbnailSize).charCodeAt(0))
            .writeInt(Number(file.localId));
          break;
        case ThumbnailSource.CHAT_PHOTO_BIG:
        case ThumbnailSource.CHAT_PHOTO_SMALL:
          writer
            .writeBigInt(BigInt(String(file.chatId)))
            .writeBigInt(BigInt(String(file.chatAccessHash)))
            .writeInt(Number(file.localId));
          break;
        case ThumbnailSource.STICKER_SET_THUMBNAIL:
          writer
            .writeBigInt(BigInt(String(file.stickerSetId)))
            .writeBigInt(BigInt(String(file.stickerSetAccessHash)))
            .writeInt(Number(file.localId));
          break;
        default:
          throw new Error(`unknown encoder for thumbnailSource ${file.thumbnailSource}`);
      }
    }
    return base64_url_encode(
      Buffer.concat([rle_encode(writer.results()), Buffer.from([file.subVersion, file.subVersion])])
    );
  }
  static uniqueId(file: Options | Decode): string {
    let writer: Writer;
    switch (file.fileTypeUniqueId) {
      case FileTypeUniqueId.WEB:
        writer = new Writer(Buffer.byteLength(file.url!, 'utf8') + 8);
        writer.writeInt(Number(file.fileTypeUniqueId)).writeString(String(file.url));
        break;
      case FileTypeUniqueId.PHOTO:
        writer = new Writer(16);
        writer
          .writeInt(Number(file.fileTypeUniqueId))
          .writeBigInt(BigInt(String(file.volumeId)))
          .writeInt(Number(file.localId));
        break;
      case FileTypeUniqueId.DOCUMENT:
        writer = new Writer(12);
        writer.writeInt(Number(file.fileTypeUniqueId)).writeBigInt(BigInt(String(file.id)));
        break;
      default:
        throw new Error(`unknown encoder for fileTypeUniqueId ${file.fileTypeUniqueId}`);
    }
    return base64_url_encode(rle_encode(writer.results()));
  }
}
