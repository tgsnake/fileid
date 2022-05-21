// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2022 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { FileId } from '../src';

const fileId = new FileId();
const b = fileId.decodeFileId(
  'CAACAgUAAxkBAAICkWKJVMsbXiNrI4bcjVCAnovOusd-AALCAQACHzxQVap5q1_iQyDnHgQ'
);
const c = b.encodeFileId();
console.log(c);
