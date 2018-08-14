export default class Translation {
  language;

  resource;

  constructor(language, resource) {
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
