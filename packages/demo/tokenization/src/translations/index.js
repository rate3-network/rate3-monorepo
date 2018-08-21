import i18next from 'i18next';
import { reactI18nextModule } from 'react-i18next';

// -- Import language packs here --
import en from './packs/en';


class TranslationHandler {
  static translations = [
    // -- Add translations here --
    en,
  ];

  /**
   * Initializer for language translations.
   *
   * Translations are implemented using the i18next package coupled with react-i18next.
   * The documentation for the configuration options can be found at
   * https://www.i18next.com/overview/configuration-options.
   *
   * It is highly recommended to read through the content in the following links to better
   * understand the utilization of the packages.
   *
   * - i18next
   *   - [Namespacing](https://www.i18next.com/principles/namespaces)
   *   - [Adding translations](https://www.i18next.com/how-to/add-or-load-translations)
   *   - [Translation Context](https://www.i18next.com/translation-function/context)
   *
   *
   * - react-i18next
   *   - [i18nextProvider](https://react.i18next.com/components/i18nextprovider)
   *   - [Trans Component](https://react.i18next.com/components/trans-component)
   *
   * @param {string} [lng] Language to initialize with.
   * @return {Object} The configured i18next instance.
   */
  static init(lng) {
    // Configure i18next
    i18next
      .use(reactI18nextModule)
      .init({
        ...(lng) ? { lng } : null,
        fallbackLng: en.getLanguage().getCodeName(),
        react: { // refer to https://react.i18next.com/components/i18next-instance for available settings
          wait: true,
        },
        debug: true,
        resources: TranslationHandler.getResourcesFromTranslationsForI18Next(),
      });

    return i18next;
  }

  /**
   * Resource builder for i18next configuration.
   *
   * @return {Object} The `resource` object to be consumed by i18next.
   */
  static getResourcesFromTranslationsForI18Next() {
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
  static getSupportedLanguages() {
    return TranslationHandler.translations.map(translation => translation.getLanguage());
  }

  /**
   * Sets the current language to show.
   *
   * @param {string} languageCodeName Code name for translation language.
   * @return {void}
   */
  static setLanguage(languageCodeName) {
    i18next.changeLanguage(languageCodeName);
  }
}

export default TranslationHandler;
