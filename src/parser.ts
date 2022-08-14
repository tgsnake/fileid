/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2022 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Decode } from './decode';
import { Encode } from './encode';
import { Options } from './utils';

export namespace FileId {
  /**
   * Encoding both fileId and fileUniqueId.
   */
  export function encode(file: Options | Decode): Encode {
    return Encode.encode(file);
  }
  /**
   * Get only string of file id.
   */
  export function encodeFileId(file: Options | Decode): string {
    return Encode.fileId(file);
  }
  /**
   * Get only string of unique id.
   */
  export function encodeUniqueId(file: Options | Decode): string {
    return Encode.uniqueId(file);
  }
  /**
   * Decode both fileId and uniqueId.
   */
  export function decode(fileId: string, uniqueId: string): [fileId: Decode, uniqueId: Decode] {
    return [Decode.fileId(fileId), Decode.uniqueId(uniqueId)];
  }
  /**
   * Decode only fileId.
   */
  export function decodeFileId(fileId: string): Decode {
    return Decode.fileId(fileId);
  }
  /**
   * Decode only uniqueId
   */
  export function decodeUniqueId(uniqueId: string): Decode {
    return Decode.uniqueId(uniqueId);
  }
}
