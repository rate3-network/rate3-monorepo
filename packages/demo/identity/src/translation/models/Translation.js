/* @flow */
import Language from './Language';

export default class Translation {
  language: Language;
  resource: Object;

  constructor(language: Language, resource: Object) {
    this.language = language;
    this.resource = resource;
  }

  getLanguage() {
    return this.language;
  }

  getResource() {
    return this.resource;
  }
}
