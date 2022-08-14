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

const file = FileId.decodeFileId(
  'CAACAgUAAxkBAAIC82L4hsBPQiPQjtkuqmPUHUedC8zqAALkAwAC2iu4VUBhx3SHETeyHgQ'
);
console.log(file);
console.log(FileId.encodeFileId(file));
