// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2022 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import * as Util from 'node:util';
import {
  FileType,
  ThumbnailSource,
  FileTypeUniqueId,
  base64_url_encode,
  base64_url_decode,
  rle_encode,
  rle_decode,
  Writer,
  Reader,
  PHOTO_TYPES,
} from './';

export interface FileIdOption<CustomBigInt> {
  /**
   * The major version of bot api file id. Usually is 4.
   */
  version: number;
  /**
   * The minor version of bot api file id. Usually same with tdlib version or 32.
   */
  subVersion: number;
  /**
   * The data center id, where that file is stored.
   */
  dcId: number;
  /**
   * The enum/number of FileType. recommend to use enum.
   * ```ts
   * import { FileType, FileId } from "@tgsnake/fileid"
   * const fileId = new FileId({
   *  fileType : FileType.PHOTO
   * })
   * ```
   */
  fileType: FileType;
  /**
   * The id of file.
   */
  id: CustomBigInt;
  /**
   * The hash to access that file.
   */
  accessHash: CustomBigInt;
  /**
   * File reference of that file.
   */
  fileRefference?: Buffer;
  /**
   * If the file has web location, fill this with url of that web location.
   */
  url?: string;
  /**
   * If the file has volume id, fill this with it. or if file doesn't have a volume id, fill this with BigInt(0). This is required when you try to make file id of photo/thumbnail.
   */
  volumeId?: CustomBigInt;
  /**
   * If the file has local id, fill this with it. or if file doesn't have a local id, fill this with 0. This is required when you try to make file id of photo/thumbnail.
   */
  localId?: number;
  /**
   * The secret key from file, if file doesn't have a secret key fill this with BigInt(0). This is required when you try to make ThumbnailSource.LEGACY
   */
  secret?: CustomBigInt;
  /**
   * If you want to make a file id of photo profil, fill this with BigInt of chatId.
   */
  chatId?: CustomBigInt;
  /**
   * If you want to make a file id of photo profil, fill this with BigInt of accessHash that chat, or BigInt(0) it must be work when you doesn't have a accessHash of that chat.
   */
  chatAccessHash?: CustomBigInt;
  /**
   * The id of that sticker set.
   */
  stickerSetId?: CustomBigInt;
  /**
   * The accessHash of that sticker set. BigInt(0) ot must be work when you doesn't have a accessHash of that sticker set.
   */
  stickerSetAccessHash?: CustomBigInt;
  /**
   * The enum/number of ThumbnailSource. recommended to use enum.
   * ```ts
   * import { FileId, ThumbnailSource } from "@tgsnake/fileid"
   * const fileId = new FileId({
   *  thumbnailSource : ThumbnailSource.DOCUMENT
   * })
   * ```
   */
  thumbnailSource?: ThumbnailSource;
  /**
   * The enum/number of FileType. recommend to use enum.
   * ```ts
   * import { FileType, FileId } from "@tgsnake/fileid"
   * const fileId = new FileId({
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
   * const fileId = new FileId({
   *  fileType : FileTypeUniqueId.PHOTO
   * })
   * ```
   */
  fileTypeUniqueId?: FileTypeUniqueId;
}

export class FileId<CustomBigInt = bigint> {
  fileId!: string;
  uniqueFileId!: string;
  private _version: number = 4;
  private _subVersion: number = 32;
  private _dcId!: number;
  private _fileType!: FileType;
  private _id!: CustomBigInt;
  private _accessHash!: CustomBigInt;
  private _fileRefference?: Buffer;
  private _url?: string;
  private _volumeId?: CustomBigInt;
  private _localId?: number;
  private _secret?: CustomBigInt;
  private _chatId?: CustomBigInt;
  private _chatAccessHash?: CustomBigInt;
  private _stickerSetId?: CustomBigInt;
  private _stickerSetAccessHash?: CustomBigInt;
  private _thumbnailFileType?: FileType;
  private _thumbnailSource?: ThumbnailSource;
  private _thumbnailSize?: string;
  private _fileTypeUniqueId?: FileTypeUniqueId;

  constructor(options?: FileIdOption<CustomBigInt>) {
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        this[`_${key}`] = value;
      }
    }
  }
  encodeFileId(): FileId<CustomBigInt> {
    if (this._fileRefference) {
      this._fileType |= FileType.FILE_REFERENCE_FLAG;
    }
    if (this._url) {
      this._fileType |= FileType.WEB_LOCATION_FLAG;
    }
    const writer = new Writer(this._url ? Buffer.byteLength(this._url!, 'utf8') + 32 : 100);
    writer.writeInt(Number(this._fileType)).writeInt(Number(this._dcId));
    if (this._url) {
      writer.writeString(this._url!);
    }
    if (this._fileRefference) {
      writer.writeBuffer(this._fileRefference!);
    }
    writer.writeBigInt(BigInt(String(this._id))).writeBigInt(BigInt(String(this._accessHash)));
    if (PHOTO_TYPES.includes(this._fileType)) {
      writer.writeBigInt(BigInt(String(this._volumeId)));
      if (this._version >= 4) writer.writeInt(Number(this._thumbnailSource));
      switch (this._thumbnailSource) {
        case ThumbnailSource.LEGACY:
          writer.writeBigInt(BigInt(String(this._secret))).writeInt(Number(this._localId));
        case ThumbnailSource.THUMBNAIL:
          writer
            .writeInt(Number(this._thumbnailFileType))
            .writeInt(String(this._thumbnailSize).charCodeAt(0))
            .writeInt(Number(this._localId));
          break;
        case ThumbnailSource.CHAT_PHOTO_BIG:
        case ThumbnailSource.CHAT_PHOTO_SMALL:
          writer
            .writeBigInt(BigInt(String(this._chatId)))
            .writeBigInt(BigInt(String(this._chatAccessHash)))
            .writeInt(Number(this._localId));
          break;
        case ThumbnailSource.STICKER_SET_THUMBNAIL:
          writer
            .writeBigInt(BigInt(String(this._stickerSetId)))
            .writeBigInt(BigInt(String(this._stickerSetAccessHash)))
            .writeInt(Number(this._localId));
          break;
        default:
          throw new Error(`unknown encoder for thumbnailSource ${this._thumbnailSource}`);
      }
    }
    this.fileId = base64_url_encode(
      Buffer.concat([
        rle_encode(writer.results()),
        Buffer.from([this._subVersion, this._subVersion]),
      ])
    );
    return this;
  }
  encodeUniqueFileId(): FileId<CustomBigInt> {
    let writer: Writer;
    switch (this._fileTypeUniqueId) {
      case FileTypeUniqueId.WEB:
        writer = new Writer(Buffer.byteLength(this._url!, 'utf8') + 8);
        writer.writeInt(Number(this._fileTypeUniqueId)).writeString(String(this._url));
        break;
      case FileTypeUniqueId.PHOTO:
        writer = new Writer(16);
        writer
          .writeInt(Number(this._fileTypeUniqueId))
          .writeBigInt(BigInt(String(this._volumeId)))
          .writeInt(Number(this._localId));
        break;
      case FileTypeUniqueId.DOCUMENT:
        writer = new Writer(12);
        writer.writeInt(Number(this._fileTypeUniqueId)).writeBigInt(BigInt(String(this._id)));
        break;
      default:
        throw new Error(`unknown encoder for fileTypeUniqueId ${this._fileTypeUniqueId}`);
    }
    this.uniqueFileId = base64_url_encode(rle_encode(writer.results()));
    return this;
  }
  decodeFileId(fileId?: string): FileId<bigint> {
    const _fileId = fileId ?? this.fileId;
    if (!_fileId) throw new Error('unknown fileId.');
    const buffer = base64_url_decode(_fileId);
    const version = buffer[buffer.length - 1];
    const subVersion = version >= 4 ? buffer[buffer.length - 2] : 0;
    const rle = rle_decode(version >= 4 ? buffer.slice(0, -2) : buffer.slice(0, -1));
    const reader = new Reader(rle);
    let fileType = reader.readInt();
    const dcId = reader.readInt();
    const hasWebLocation = Boolean(fileType & FileType.WEB_LOCATION_FLAG);
    const hasFileRefference = Boolean(fileType & FileType.FILE_REFERENCE_FLAG);
    fileType &= ~FileType.WEB_LOCATION_FLAG;
    fileType &= ~FileType.FILE_REFERENCE_FLAG;
    const FileTypes = Object.values(FileType).filter((v) => typeof v === 'number');
    if (!FileTypes.includes(fileType)) {
      throw new Error(`unknown fileType ${fileType} of fileId ${_fileId}`);
    }
    let obj: FileIdOption<bigint> = {
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
      return new FileId<bigint>(obj);
    }
    if (hasFileRefference) obj.fileRefference = reader.readBuffer();
    obj.id = reader.readBigInt();
    obj.accessHash = reader.readBigInt();
    if (PHOTO_TYPES.includes(fileType)) {
      obj.volumeId = reader.readBigInt();
      obj.thumbnailSource = reader.readInt();
      switch (obj.thumbnailSource) {
        case ThumbnailSource.LEGACY:
          obj.secret = reader.readBigInt();
          obj.localId = reader.readInt();
          return new FileId<bigint>(obj);
          break;
        case ThumbnailSource.THUMBNAIL:
          obj.thumbnailFileType = reader.readInt();
          obj.thumbnailSize = String.fromCharCode(reader.readInt());
          obj.localId = reader.readInt();
          return new FileId<bigint>(obj);
        case ThumbnailSource.CHAT_PHOTO_BIG:
        case ThumbnailSource.CHAT_PHOTO_SMALL:
          obj.chatId = reader.readBigInt();
          obj.chatAccessHash = reader.readBigInt();
          obj.localId = reader.readInt();
          return new FileId<bigint>(obj);
          break;
        case ThumbnailSource.STICKER_SET_THUMBNAIL:
          obj.stickerSetId = reader.readBigInt();
          obj.stickerSetAccessHash = reader.readBigInt();
          obj.localId = reader.readInt();
          return new FileId<bigint>(obj);
          break;
        default:
          throw new Error(`unknown ThumbnailSource ${obj.thumbnailSource} of fileId ${_fileId}`);
      }
    }
    return new FileId(obj);
  }
  decodeUniqueFileId(uniqueFileId?: string): FileId<bigint> {
    const _uniqueFileId = uniqueFileId ?? this.uniqueFileId;
    if (!_uniqueFileId) throw new Error('unknown uniqueFileId.');
    const rle = rle_decode(base64_url_decode(_uniqueFileId));
    const reader = new Reader(rle);
    const fileTypeUniqueId = reader.readInt();
    switch (fileTypeUniqueId) {
      case FileTypeUniqueId.WEB:
        //@ts-ignore
        return new FileId<bigint>({
          fileTypeUniqueId,
          url: reader.readString(),
        });
        break;
      case FileTypeUniqueId.PHOTO:
        //@ts-ignore
        return new FileId<bigint>({
          fileTypeUniqueId,
          volumeId: reader.readBigInt(),
          localId: reader.readInt(),
        });
        break;
      case FileTypeUniqueId.DOCUMENT:
        //@ts-ignore
        return new FileId<bigint>({
          fileTypeUniqueId,
          id: reader.readBigInt(),
        });
        break;
      default:
        throw new Error(
          `unknown decoder for fileTypeUniqueId ${fileTypeUniqueId} of uniqueFileId ${_uniqueFileId}`
        );
    }
    return new FileId<bigint>();
  }
  [Util.inspect.custom](): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        if (!key.startsWith('_')) {
          toPrint[key] = this[key];
        } else {
          toPrint[key.replace('_', '')] = this[key];
        }
      }
    }
    return toPrint;
  }
  toJSON(): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = typeof value === 'bigint' ? String(value) : value;
        } else {
          toPrint[key.replace('_', '')] = typeof value === 'bigint' ? String(value) : value;
        }
      }
    }
    return toPrint;
  }
  toString(): string {
    return '[FileId Class Constructor].';
  }
  // getters
  get version(): number {
    return this._version;
  }
  get subVersion(): number {
    return this._subVersion;
  }
  get dcId(): number {
    return this._dcId;
  }
  get fileType(): FileType {
    return this._fileType;
  }
  get id(): CustomBigInt {
    return this._id;
  }
  get accessHash(): CustomBigInt {
    return this._accessHash;
  }
  get fileRefference(): Buffer | undefined {
    return this._fileRefference;
  }
  get url(): string | undefined {
    return this._url;
  }
  get volumeId(): CustomBigInt | undefined {
    return this.volumeId;
  }
  get localId(): number | undefined {
    return this._localId;
  }
  get secret(): CustomBigInt | undefined {
    return this._secret;
  }
  get chatId(): CustomBigInt | undefined {
    return this._chatId;
  }
  get chatAccessHash(): CustomBigInt | undefined {
    return this._chatAccessHash;
  }
  get stickerSetId(): CustomBigInt | undefined {
    return this._stickerSetId;
  }
  get stickerSetAccessHash(): CustomBigInt | undefined {
    return this._stickerSetAccessHash;
  }
  get thumbnailFileType(): FileType | undefined {
    return this.thumbnailFileType;
  }
  get thumbnailSource(): ThumbnailSource | undefined {
    return this._thumbnailSource;
  }
  get thumbnailSize(): string | undefined {
    return this._thumbnailSize;
  }
  get fileTypeUniqueId(): FileTypeUniqueId | undefined {
    return this._fileTypeUniqueId;
  }
}
