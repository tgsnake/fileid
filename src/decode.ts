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
  base64_url_decode,
  rle_decode,
  Writer,
  Reader,
  PHOTO_TYPES,
  Options,
} from './';

export class Decode implements Options {
  /**
   * The major version of bot api file id. Usually is 4.
   */
  version!: number;
  /**
   * The minor version of bot api file id. Usually same with tdlib version or 32.
   */
  subVersion!: number;
  /**
   * The data center id, where that file is stored.
   */
  dcId!: number;
  /**
   * The enum/number of FileType. recommend to use enum.
   * ```ts
   * import { FileType, FileId } from "@tgsnake/fileid"
   * const fileId = FileId.encode({
   *  fileType : FileType.PHOTO
   * })
   * ```
   */
  fileType!: FileType;
  /**
   * The id of file.
   */
  id!: bigint;
  /**
   * The hash to access that file.
   */
  accessHash!: bigint;
  /**
   * File reference of that file.
   */
  fileReference?: Buffer;
  /**
   * If the file has web location, fill this with url of that web location.
   */
  url?: string;
  /**
   * If the file has volume id, fill this with it. or if file doesn't have a volume id, fill this with BigInt(0). This is required when you try to make file id of photo/thumbnail.
   */
  volumeId?: bigint;
  /**
   * If the file has local id, fill this with it. or if file doesn't have a local id, fill this with 0. This is required when you try to make file id of photo/thumbnail.
   */
  localId?: number;
  /**
   * The secret key from file, if file doesn't have a secret key fill this with BigInt(0). This is required when you try to make ThumbnailSource.LEGACY
   */
  secret?: bigint;
  /**
   * If you want to make a file id of photo profil, fill this with BigInt of chatId.
   */
  chatId?: bigint;
  /**
   * If you want to make a file id of photo profil, fill this with BigInt of accessHash that chat, or BigInt(0) it must be work when you doesn't have a accessHash of that chat.
   */
  chatAccessHash?: bigint;
  /**
   * The id of that sticker set.
   */
  stickerSetId?: bigint;
  /**
   * The accessHash of that sticker set. BigInt(0) ot must be work when you doesn't have a accessHash of that sticker set.
   */
  stickerSetAccessHash?: bigint;
  /**
   * The enum/number of ThumbnailSource. recommended to use enum.
   * ```ts
   * import { FileId, ThumbnailSource } from "@tgsnake/fileid"
   * const fileId = FileId.encode({
   *  thumbnailSource : ThumbnailSource.DOCUMENT
   * })
   * ```
   */
  thumbnailSource?: ThumbnailSource;
  /**
   * The enum/number of FileType. recommend to use enum.
   * ```ts
   * import { FileType, FileId } from "@tgsnake/fileid"
   * const fileId = FileId.encode({
   *  thumbnailFileType : FileType.PHOTO
   * })
   * ```
   */
  thumbnailFileType?: FileType;
  /**
   * The size of that thumbnail.
   * see : https://core.telegram.org/api/files#image-thumbnail-types
   */
  thumbnailSize?: string;
  /**
   * Only for generating uniqueFileId.
   * The enum/number of FileTypeUniqueId. recommended to use enum.
   * ```ts
   * import { FileTypeUniqueId, FileId } from "@tgsnake/fileid"
   * const fileId = FileId.encode({
   *  fileType : FileTypeUniqueId.PHOTO
   * })
   * ```
   */
  fileTypeUniqueId?: FileTypeUniqueId;
  constructor({
    version,
    subVersion,
    dcId,
    fileType,
    id,
    accessHash,
    fileReference,
    url,
    volumeId,
    localId,
    secret,
    chatId,
    chatAccessHash,
    stickerSetId,
    stickerSetAccessHash,
    thumbnailSource,
    thumbnailFileType,
    thumbnailSize,
    fileTypeUniqueId,
  }: Options) {
    this.version = version;
    this.subVersion = subVersion;
    this.dcId = dcId;
    this.fileType = fileType;
    this.id = id;
    this.accessHash = accessHash;
    this.fileReference = fileReference;
    this.url = url;
    this.volumeId = volumeId ?? BigInt(0);
    this.localId = localId ?? 0;
    this.secret = secret;
    this.chatId = chatId;
    this.chatAccessHash = chatAccessHash;
    this.stickerSetId = stickerSetId;
    this.stickerSetAccessHash = stickerSetAccessHash;
    this.thumbnailSource = thumbnailSource;
    this.thumbnailFileType = thumbnailFileType;
    this.thumbnailSize = thumbnailSize;
    this.fileTypeUniqueId = fileTypeUniqueId;
  }
  static fileId(fileId: string): Decode {
    const buffer = base64_url_decode(fileId);
    const version = buffer[buffer.length - 1];
    const subVersion = version >= 4 ? buffer[buffer.length - 2] : 0;
    const rle = rle_decode(version >= 4 ? buffer.slice(0, -2) : buffer.slice(0, -1));
    const reader = new Reader(rle);
    let fileType = reader.readInt();
    const dcId = reader.readInt();
    const hasWebLocation = Boolean(fileType & FileType.WEB_LOCATION_FLAG);
    const hasFileReference = Boolean(fileType & FileType.FILE_REFERENCE_FLAG);
    fileType &= ~FileType.WEB_LOCATION_FLAG;
    fileType &= ~FileType.FILE_REFERENCE_FLAG;
    const FileTypes = Object.values(FileType).filter((v) => typeof v === 'number');
    if (!FileTypes.includes(fileType)) {
      throw new Error(`unknown fileType ${fileType} of fileId ${fileId}`);
    }
    let obj: Options = {
      //@ts-ignore
      version,
      subVersion,
      dcId,
      fileType,
      id: BigInt(0),
      accessHash: BigInt(0),
    };
    if (hasWebLocation) {
      obj.url = reader.readString();
      obj.id = reader.readBigInt();
      obj.accessHash = reader.readBigInt();
      return new Decode(obj);
    }
    if (hasFileReference) obj.fileReference = reader.readBuffer();
    obj.id = reader.readBigInt();
    obj.accessHash = reader.readBigInt();
    if (PHOTO_TYPES.includes(fileType)) {
      obj.volumeId = reader.readBigInt();
      obj.thumbnailSource = reader.readInt();
      switch (obj.thumbnailSource) {
        case ThumbnailSource.LEGACY:
          obj.secret = reader.readBigInt();
          obj.localId = reader.readInt();
          return new Decode(obj);
          break;
        case ThumbnailSource.THUMBNAIL:
          obj.thumbnailFileType = reader.readInt();
          obj.thumbnailSize = String.fromCharCode(reader.readInt());
          obj.localId = reader.readInt();
          return new Decode(obj);
        case ThumbnailSource.CHAT_PHOTO_BIG:
        case ThumbnailSource.CHAT_PHOTO_SMALL:
          obj.chatId = reader.readBigInt();
          obj.chatAccessHash = reader.readBigInt();
          obj.localId = reader.readInt();
          return new Decode(obj);
          break;
        case ThumbnailSource.STICKER_SET_THUMBNAIL:
          obj.stickerSetId = reader.readBigInt();
          obj.stickerSetAccessHash = reader.readBigInt();
          obj.localId = reader.readInt();
          return new Decode(obj);
          break;
        default:
          throw new Error(`unknown ThumbnailSource ${obj.thumbnailSource} of fileId ${fileId}`);
      }
    }
    return new Decode(obj);
  }
  static uniqueId(uniqueId: string): Decode {
    const rle = rle_decode(base64_url_decode(uniqueId));
    const reader = new Reader(rle);
    const fileTypeUniqueId = reader.readInt();
    switch (fileTypeUniqueId) {
      case FileTypeUniqueId.WEB:
        //@ts-ignore
        return new Decode({
          fileTypeUniqueId,
          url: reader.readString(),
        });
        break;
      case FileTypeUniqueId.PHOTO:
        //@ts-ignore
        return new Decode({
          fileTypeUniqueId,
          volumeId: reader.readBigInt(),
          localId: reader.readInt(),
        });
        break;
      case FileTypeUniqueId.DOCUMENT:
        //@ts-ignore
        return new Decode({
          fileTypeUniqueId,
          id: reader.readBigInt(),
        });
        break;
      default:
        throw new Error(
          `unknown decoder for fileTypeUniqueId ${fileTypeUniqueId} of uniqueFileId ${uniqueId}`
        );
    }
  }
  [Symbol.for('nodejs.util.inspect.custom')](): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = value;
        }
      }
    }
    return toPrint;
  }
  toJSON(): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = typeof value === 'bigint' ? String(value) : value;
        }
      }
    }
    return toPrint;
  }
  toString() {
    return `[constructor of ${this.constructor.name}] ${JSON.stringify(this, null, 2)}`;
  }
}
