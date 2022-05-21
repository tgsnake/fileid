# @tgsnake/fileid

Core framework for creating fileId for tgsnake.

> _This framework is ported or inspired from **pyrogram**, big thank for that framework._

Another framework it should be can using this framework, **not only a tgsnake**.

## The advantages we offer

- **Stable**  
  As long as we use this, the framework works fine without any problems. If a problem is found we will fix it as soon as possible.
- **Fast**  
  This framework using simple algorithm to make it fast compared to other frameworks.
- **Zero Dependencies**  
  With zero dependencies it make this framework fast and You don't have to worry about the security of this framework.
- **Typescript Support**  
  This framework is build with typescript, so for typescript user no need to worry about types, because we already have it.
- **Url Safe**  
  We are using `base64url` than `base64` for encoding the file id, which `base64url` more safe when you using for Url. see : https://stackoverflow.com/a/55389212/16600138
- **Work with another framework fileId generator**  
  This framework also supported file id of :

  - Telethon
  - Pyrogram
  - Bot Api
  - tg-file-id
  - Another framework should be we supported too.

  > We just tester for decoding file id from that framework, nvm work for re-sending the documents, but you can try. should be work too..

## Installation

Installing this framework with npm

```bash
  cd my-project
  npm install @tgsnake/fileid
```

Installing this framework with yarn

```bash
  cd my-project
  yarn add @tgsnake/fileid
```

## Usage/Examples

```javascript
const { FileId, FileType, ThumbnailSource, FileTypeUniqueId } = require('@tgsnake/fileid');
const fileId = new FileId();
const raw = fileId.decodeFileId(
  'CAACAgUAAxkBAAICjWKI4c8Zg7eo6bSbtAV_bVcFa9DmAAJ3BgACuNvZV0cotKoi35kTHgQ'
);
console.log(fileId);
```

## Documentation

### Options

This options is using for generating unique file id or file id. Pass this options when you create a new class from FileId.

<!-- prettier-ignore -->
| field | type | required | description |
| :------: | :-----: | :----: | :-----: | 
| version | number | true | The major version of bot api file id. Usually is 4. |
| subVersion | number | true | The minor version of bot api file id. Usually same with tdlib version or 32. |
| dcId | number | true | The data center id, where that file is stored. |
| fileType | enum/number of FileType | true | The enum/number of FileType. recommend to use enum. |
| id | bigint | true | The id of file. |
| accessHash | bigint | true | The hash to access that file. |
| fileRefference | Buffer | optional | File reference of that file. |
| url | string | optional | If the file has web location, fill this with url of that web location. |
| volumeId | bigint | optional | If the file has volume id, fill this with it. or if file doesn't have a volume id, fill this with BigInt(0). This is required when you try to make file id of photo/thumbnail. |
| localId | number | optional | If the file has local id, fill this with it. or if file doesn't have a local id, fill this with 0. This is required when you try to make file id of photo/thumbnail. |
| secret | bigint | optional | The secret key from file, if file doesn't have a secret key fill this with BigInt(0). This is required when you try to make ThumbnailSource.LEGACY |
| chatId | bigint | optional | If you want to make a file id of photo profil, fill this with BigInt of chatId. |
| chatAccessHash | bigint | optional | If you want to make a file id of photo profil, fill this with BigInt of accessHash that chat, or BigInt(0) it must be work when you doesn't have a accessHash of that chat. |
| stickerSetId | bigint | optional | The id of that sticker set. |
| stickerSetAccessHash | bigint | optional | The accessHash of that sticker set. BigInt(0) ot must be work when you doesn't have a accessHash of that sticker set. |  | thumbnailSource | enum/number of ThumbnailSource | optional | The enum/number of ThumbnailSource. recommended to use enum. |
| thumbnailFileType | enum/number of FileType | optional | The enum/number of FileType. recommend to use enum. |
| thumbnailSize | string | optional | The size of that thumbnail.<br/> see : https://core.telegram.org/api/files#image-thumbnail-types |
| fileTypeUniqueId | enum/number of FileTypeUniqueId | Only for generating uniqueFileId. <br/> The enum/number of FileTypeUniqueId. recommended to use enum. |

### Enums

#### FileType

```ts
enum FileType {
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
}
```

Importing this enum :

```javascript
const { FileType } = require('@tgsnake/fileid');
```

#### ThumbnailSource

```ts
enum ThumbnailSource {
  LEGACY = 0,
  THUMBNAIL = 1,
  CHAT_PHOTO_SMALL = 2, // DialogPhotoSmall
  CHAT_PHOTO_BIG = 3, // DialogPhotoBig
  STICKER_SET_THUMBNAIL = 4,
}
```

Importing this enum :

```javascript
const { ThumbnailSource } = require('@tgsnake/fileid');
```

#### FileTypeUniqueId

```ts
enum FileTypeUniqueId {
  WEB = 0,
  PHOTO = 1,
  DOCUMENT = 2,
  SECURE = 3,
  ENCRYPTED = 4,
  TEMP = 5,
}
```

Importing this enum :

```javascript
const { FileTypeUniqueId } = require('@tgsnake/fileid');
```

### Generating file id.

for generating file id, you can use `.encodeFileId` method. And for decoding using `.decodeFileId`method.

```javascript
const { FileId, FileType, ThumbnailSource, FileTypeUniqueId } = require("@tgsnake/fileid")
const fileId = new FileId({
  version : 4,
  subVersion : 32,
  fileType : FileType.STICKER,
  id : ,// fill this with document id
  accessHash : , // fill this with document accessHash
  fileReference : , // fill this with document fileReference
  dcId : // fill this with document dcId
  // fill with another options.
}).encodeFileId() // the return is class FileId, so you can use other method in single line.
// for decode will return new class of FileId, so it will different with parent class.
console.log(fileId)
```

### Generating file id and uniqueFileId

for generating unique file id, you can use `.encodeUniqueFileId` method. And for decoding using `decodeUniqueFileId` method.

```javascript
const { FileId, FileType, ThumbnailSource, FileTypeUniqueId } = require("@tgsnake/fileid")
const fileId = new FileId({
  version : 4,
  subVersion : 32,
  fileType : FileType.STICKER,
  fileTypeUniqueId : FileTypeUniqueId.DOCUMENT,
  id : ,// fill this with document id
  accessHash : , // fill this with document accessHash
  fileReference : , // fill this with document fileReference
  dcId : // fill this with document dcId
  // fill with another options.
}).encodeFileId().encodeUniqueFileId() // the return is class FileId, so you can use other method in single line.
// for decode will return new class of FileId, so it will different with parent class.
console.log(fileId)
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

---

Build With ❤️ by tgsnake dev.
