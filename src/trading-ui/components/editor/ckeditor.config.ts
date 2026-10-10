import { CKEditorUploadAdapterPlugin } from './ckeditor-upload-adapter.plugin';
import { toolbarProductInfo } from './ckeditor.constant';

const SEVA_CDN_VIDEO_URL = /^https?:\/\/cdn-media(?:-[a-z0-9-]+)?\.sevagoretail\.jewelry\/.+\.(?:mp4|webm)(?:\?.*)?$/i;

const DIRECT_VIDEO_FILE_URL = /^https?:\/\/.+\.(?:mp4|webm)(?:\?.*)?$/i;

const renderHtml5Video = (match: RegExpMatchArray): string => `<video controls playsinline style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;" src="${match[0]}"></video>`;

export const getRichTextEditorConfig = () =>
  ({
    extraPlugins: [CKEditorUploadAdapterPlugin],
    toolbar: toolbarProductInfo,
    image: {
      toolbar: [
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        'imageStyle:alignLeft',
        'imageStyle:alignCenter',
        'imageStyle:alignRight',
        '|',
        'toggleImageCaption',
        'imageTextAlternative',
      ],
    },
    mediaEmbed: {
      previewsInData: true,
      extraProviders: [
        {
          name: 'sevaCdnVideo',
          url: SEVA_CDN_VIDEO_URL,
          html: renderHtml5Video,
        },
        {
          name: 'directVideoFile',
          url: DIRECT_VIDEO_FILE_URL,
          html: renderHtml5Video,
        },
      ],
    },
  }) as const;
