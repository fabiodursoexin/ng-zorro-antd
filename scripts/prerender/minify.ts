import * as fs from 'fs-extra';
import { minify as jsMinifier } from 'terser';

const htmlMinifier = require('html-minifier-terser').minify;

const minifyJsOptions = {
  keep_classnames: true,
  keep_fnames: true,
  output: {
    comments: false
  }
};

async function minifyJs(content: string): Promise<string> {
  return (await jsMinifier(content, minifyJsOptions)).code || ''
}

async function minifyHtml(content: string): Promise<string> {
  return htmlMinifier(content, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    includeAutoGeneratedTags: false,
    minifyCSS: true,
    minifyJS: minifyJsOptions,
    minifyURLs: true,
    processScripts: ['text/html'],
    ignoreCustomComments: [],
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    trimCustomFragments: true,
    useShortDoctype: true
  })
}

async function minifyJson(content: string): Promise<string> {
  // tslint:disable-next-line:no-any
  let json: any = {}
  try {
    json = JSON.parse(content)
    if (json.$schema) {
      // $schema is only needed for autocompletion
      delete json.$schema
    }
    return JSON.stringify(json)
  } catch {
    return content;
  }
}

export async function minifyFile(filePath: string, type: 'svg' | 'html' | 'json' | 'js' | string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf8');

  let minified: Promise<string>;
  switch (type) {
    case 'svg':
    case 'html':
      minified = minifyHtml(content)
      break
    case 'js':
      minified = minifyJs(content)
      break
    case 'json':
      minified = minifyJson(content)
      break
    default:
      throw new Error('Unknown extension: ' + type)
  }
  const result = await minified;
  await fs.writeFile(filePath, result);
}
