/* @flow */
export default class Language {
  name: string;
  codeName: string;

  constructor(name: string, codeName: string) {
    this.name = name;
    this.codeName = codeName; // typically using ISO 639-1 standard
    // variations in codeName should be annotated with `-` (e.g. en-GB, zh-HK, etc)
  }

  getName() {
    return this.name;
  }

  getCodeName() {
    return this.codeName;
  }
}
