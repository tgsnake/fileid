/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2022 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { FileId } from '../src';
const file = FileId.decodeFileId('AQADBQADZq8xG6uF-FQAEAIAAyGEcyoBAANi-pbYnH388wAEIAQ');
console.log(
  file,
  FileId.encodeFileId(file),
  FileId.encodeFileId({
    version: 4,
    subVersion: 32,
    dcId: 5,
    fileType: 1,
    id: BigInt('6122790663352332134'),
    accessHash: BigInt(0),
    fileReference: undefined,
    url: undefined,
    volumeId: BigInt(0),
    localId: 0,
    secret: undefined,
    chatId: BigInt('5007180833'),
    chatAccessHash: BigInt('-865678915759834526'),
    stickerSetId: undefined,
    stickerSetAccessHash: undefined,
    thumbnailSource: 2,
    thumbnailFileType: undefined,
    thumbnailSize: undefined,
    fileTypeUniqueId: undefined,
  })
);
