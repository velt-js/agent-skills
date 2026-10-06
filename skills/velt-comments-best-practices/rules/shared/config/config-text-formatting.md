---
title: Configure Rich Text Formatting in Comment Composer
impact: LOW
impactDescription: Control which text formatting options are available in the comment composer
tags: enableFormatOptions, disableFormatOptions, setFormatConfig, FormatConfig, formatting, bold, italic, underline, strikethrough
---

## Configure Rich Text Formatting in Comment Composer

The formatting toolbar is off by default. Turn it on with `formatOptions` / `enableFormatOptions()`, then choose which formats appear with `setFormatConfig()`. `FormatConfig` supports exactly four formats (`bold`, `italic`, `underline`, `strikethrough`), and each takes an `{ enable: boolean }` object, not a bare boolean.

**Incorrect (bare booleans and unsupported formats):**

```jsx
commentElement.setFormatConfig({
  bold: true,        // must be { enable: true }
  link: true,        // not a FormatConfig key
  codeBlock: true,   // not a FormatConfig key
  heading: false,    // not a FormatConfig key
});
```

**Correct:**

```jsx
const commentElement = client.getCommentElement(); // or useCommentUtils()

commentElement.enableFormatOptions();   // default false
commentElement.setFormatConfig({
  bold: { enable: true },
  italic: { enable: true },
  underline: { enable: false },
  strikethrough: { enable: false },
});
```

```jsx
<VeltComments formatOptions={true} />
```

```html
<velt-comments format-options="true"></velt-comments>
<script>
  const commentElement = Velt.getCommentElement();
  commentElement.setFormatConfig({ bold: { enable: true }, italic: { enable: true } });
</script>
```

**Verification:**
- [ ] Toolbar enabled via `formatOptions={true}` or `enableFormatOptions()`
- [ ] `setFormatConfig()` keys limited to `bold`, `italic`, `underline`, `strikethrough`
- [ ] Each key uses `{ enable: boolean }`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#text-formatting - Text Formatting
- https://docs.velt.dev/api-reference/sdk/models/data-models#formatconfig - FormatConfig
