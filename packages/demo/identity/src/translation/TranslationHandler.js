/* @flow */
import i18next from 'i18next';
import { reactI18nextModule } from 'react-i18next';

import Language from './models/Language';
import Translation from './models/Translation';

// -- Import language packs here --
import en from './packs/en';
import zhCN from './packs/zh-CN';
import ko from './packs/ko';


class TranslationHandler {
  static translations: Array<Translation> = [
    // -- Add translations here --
    en,
    zhCN,
    ko,
  ];

  /**
   * Initializer for language translations.
   *
   * Translations are implemented using the i18next package. The documentation for the
   * configuration options can be found at https://www.i18next.com/overview/configuration-options.
   *
   * It is highly recommended to read through the content in the following links to better
   * understand the concepts utilized in the usage of the i18next package.
   *
   * - Namespacing - https://www.i18next.com/principles/namespaces
   * - Adding translations - https://www.i18next.com/how-to/add-or-load-translations
   *
   * @return {Object} The configured i18next instance.
   */
  static init() {
    let defaultLanguage = navigator.language || navigator.userLanguage;
    // Configure i18next
    if (defaultLanguage === 'zh') {
      defaultLanguage = 'zh-CN';
    } else {
      // HACK: If it's not a supported language, we will just fallback to en
      const supportedLanguages = this.translations.map((translation) => {
        return translation.language.codeName;
      });
      // Hack: Fallback
      if (!supportedLanguages.includes(defaultLanguage)) {
        defaultLanguage = 'en';
      }
    }
    i18next
      .use(reactI18nextModule)
      .init({
        lng: defaultLanguage,
        fallbackLng: en.getLanguage().getCodeName(),
        react: { // refer to https://react.i18next.com/components/i18next-instance for available settings
          wait: true,
        },
        resources: TranslationHandler.getResourcesFromTranslationsForI18Next(),
      });

    return i18next;
  }

  /**
   * Resource builder for i18next configuration.
   *
   * @return {Object} The `resource` object to be consumed by i18next.
   */
  static getResourcesFromTranslationsForI18Next(): Object {
    const resources = {};

    this.translations.forEach((translation) => {
      const languageCodeName = translation.getLanguage().getCodeName();
      const languageResource = translation.getResource();
      resources[languageCodeName] = languageResource;
    });

    return resources;
  }

  /**
   * Get all languages which have translations added.
   *
   * @returns {Array<Language>} All supported languages.
   */
  static getSupportedLanguages(): Array<Language> {
    return TranslationHandler.translations.map((translation) => {
      return translation.getLanguage();
    });
  }

  /**
   * Sets the current language to show.
   *
   * @param {string} languageCodeName Code name for translation language.
   * @return {void}
   */
  static setLanguage(languageCodeName: string) {
    window.localStorage['default-language'] = languageCodeName;
    i18next.changeLanguage(languageCodeName);
  }

  static getLanguage(): Object {
    const arrOfLanguages = this.getSupportedLanguages();
    const [lang] = arrOfLanguages.filter((l) => {
      if (!l.codeName || !i18next.language) return false;
      return (
        l.codeName === i18next.language ||
        l.codeName === i18next.language.split('-')[0] ||
        l.codeName.split('-')[0] === i18next.language.split('-')[0] ||
        l.codeName.split('-')[0] === i18next.language
      );
    });
    return lang;
  }
}

export default TranslationHandler;
