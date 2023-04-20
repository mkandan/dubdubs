# credit to https://github.com/vats98754/stringtoiso/tree/main

str2iso_639_1 = {'Abkhaz': 'ab',
                 'Afar': 'aa',
                 'Afrikaans': 'af',
                 'Akan': 'ak',
                 'Albanian': 'sq',
                 'Amharic': 'am',
                 'Arabic': 'ar',
                 'Aragonese': 'an',
                 'Armenian': 'hy',
                 'Assamese': 'as',
                 'Avaric': 'av',
                 'Avestan': 'ae',
                 'Aymara': 'ay',
                 'Azerbaijani': 'az',
                 'Bambara': 'bm',
                 'Bashkir': 'ba',
                 'Basque': 'eu',
                 'Belarusian': 'be',
                 'Bengali': 'bn',
                 'Bangla': 'bn',
                 'Bihari': 'bh',
                 'Bislama': 'bi',
                 'Bosnian': 'bs',
                 'Breton': 'br',
                 'Bulgarian': 'bg',
                 'Burmese': 'my',
                 'Catalan': 'ca',
                 'Valencian': 'ca',
                 'Chamorro': 'ch',
                 'Chechen': 'ce',
                 'Chichewa': 'ny',
                 'Chewa': 'ny',
                 'Nyanja': 'ny',
                 'Chinese': 'zh',
                 'Chuvash': 'cv',
                 'Cornish': 'kw',
                 'Corsican': 'co',
                 'Cree': 'cr',
                 'Croatian': 'hr',
                 'Czech': 'cs',
                 'Danish': 'da',
                 'Divehi': 'dv',
                 'Dhivehi': 'dv',
                 'Maldivian': 'dv',
                 'Dutch': 'nl',
                 'Dzongkha': 'dz',
                 'English': 'en',
                 'Esperanto': 'eo',
                 'Estonian': 'et',
                 'Ewe': 'ee',
                 'Faroese': 'fo',
                 'Fijian': 'fj',
                 'Finnish': 'fi',
                 'French': 'fr',
                 'Fula': 'ff',
                 'Fulah': 'ff',
                 'Pulaar': 'ff',
                 'Pular': 'ff',
                 'Galician': 'gl',
                 'Ganda': 'lg',
                 'Georgian': 'ka',
                 'German': 'de',
                 'Greek': 'el',
                 'Greek, Modern': 'el',
                 'Greek (Modern)': 'el',
                 'Guaraní': 'gn',
                 'Gujarati': 'gu',
                 'Haitian': 'ht',
                 'Haitian Creole': 'ht',
                 'Hausa': 'ha',
                 'Hebrew': 'he',
                 'Hebrew, Modern': 'he',
                 'Hebrew (Modern)': 'he',
                 'Herero': 'hz',
                 'Hindi': 'hi',
                 'Hiri Motu': 'ho',
                 'Hungarian': 'hu',
                 'Icelandic': 'is',
                 'Ido': 'io',
                 'Igbo': 'ig',
                 'Indonesian': 'id',
                 'Interlingua': 'ia',
                 'Interlingue': 'ie',
                 'Inuktitut': 'iu',
                 'Inupiaq': 'ik',
                 'Irish': 'ga',
                 'Italian': 'it',
                 'Japanese': 'ja',
                 'Javanese': 'jv',
                 'Kalaallisut': 'kl',
                 'Greenlandic': 'kl',
                 'Kannada': 'kn',
                 'Kanuri': 'kr',
                 'Kashmiri': 'ks',
                 'Kazakh': 'kk',
                 'Khmer': 'km',
                 'Kikuyu': 'ki',
                 'Gikuyu': 'ki',
                 'Kinyarwanda': 'rw',
                 'Kirundi': 'rn',
                 'Komi': 'kv',
                 'Kongo': 'kg',
                 'Korean': 'ko',
                 'Kurdish': 'ku',
                 'Kwanyama': 'kj',
                 'Kuanyama': 'kj',
                 'Kyrgyz': 'ky',
                 'Lao': 'lo',
                 'Latin': 'la',
                 'Latvian': 'lv',
                 'Limburgish': 'li',
                 'Limburgan': 'li',
                 'Limburger': 'li',
                 'Lingala': 'ln',
                 'Lithuanian': 'lt',
                 'Luba-Katanga': 'lu',
                 'Luxembourgish': 'lb',
                 'Letzeburgesch': 'lb',
                 'Macedonian': 'mk',
                 'Malagasy': 'mg',
                 'Malay': 'ms',
                 'Malayalam': 'ml',
                 'Maltese': 'mt',
                 'Manx': 'gv',
                 'Marathi (Marāṭhī)': 'mr',
                 'Marathi': 'mr',
                 'Marāṭhī': 'mr',
                 'Marshallese': 'mh',
                 'Mongolian': 'mn',
                 'Māori': 'mi',
                 'Nauru': 'na',
                 'Navajo, Navaho': 'nv',
                 'Ndonga': 'ng',
                 'Nepali': 'ne',
                 'North Ndebele': 'nd',
                 'Northern Sami': 'se',
                 'Norwegian': 'no',
                 'Norwegian Bokmål': 'nb',
                 'Norwegian Nynorsk': 'nn',
                 'Nuosu': 'ii',
                 'Occitan': 'oc',
                 'Ojibwe': 'oj',
                 'Ojibwa': 'oj',
                 'Old Church Slavonic': 'cu',
                 'Church Slavonic': 'cu',
                 'Old Bulgarian': 'cu',
                 'Oriya': 'or',
                 'Oromo': 'om',
                 'Ossetian': 'os',
                 'Ossetic': 'os',
                 'Panjabi': 'pa',
                 'Punjabi': 'pa',
                 'Pashto': 'ps',
                 'Pushto': 'ps',
                 'Persian (Farsi)': 'fa',
                 'Persian': 'fa',
                 'Farsi': 'fa',
                 'Polish': 'pl',
                 'Portuguese': 'pt',
                 'Pāli': 'pi',
                 'Quechua': 'qu',
                 'Romanian': 'ro',
                 'Romansh': 'rm',
                 'Russian': 'ru',
                 'Samoan': 'sm',
                 'Sango': 'sg',
                 'Sanskrit (Saṁskṛta)': 'sa',
                 'Sanskrit': 'sa',
                 'Saṁskṛta': 'sa',
                 'Sardinian': 'sc',
                 'Scottish Gaelic': 'gd',
                 'Gaelic': 'gd',
                 'Serbian': 'sr',
                 'Shona': 'sn',
                 'Sindhi': 'sd',
                 'Sinhala': 'si',
                 'Sinhalese': 'si',
                 'Slovak': 'sk',
                 'Slovene': 'sl',
                 'Somali': 'so',
                 'South Azerbaijani': 'az',
                 'South Ndebele': 'nr',
                 'Southern Sotho': 'st',
                 'Spanish': 'es',
                 'Castilian': 'es',
                 'Sundanese': 'su',
                 'Swahili': 'sw',
                 'Swati': 'ss',
                 'Swedish': 'sv',
                 'Tagalog': 'tl',
                 'Tahitian': 'ty',
                 'Tajik': 'tg',
                 'Tamil': 'ta',
                 'Tatar': 'tt',
                 'Telugu': 'te',
                 'Thai': 'th',
                 'Tibetan Standard, Tibetan, Central': 'bo',
                 'Tibetan, Central': 'bo',
                 'Tibetan Standard': 'bo',
                 'Tibetan': 'bo',
                 'Tigrinya': 'ti',
                 'Tonga (Tonga Islands)': 'to',
                 'Tonga': 'to',
                 'Tonga Islands': 'to',
                 'Tsonga': 'ts',
                 'Tswana': 'tn',
                 'Turkish': 'tr',
                 'Turkmen': 'tk',
                 'Twi': 'tw',
                 'Ukrainian': 'uk',
                 'Urdu': 'ur',
                 'Uyghur': 'ug',
                 'Uighur': 'ug',
                 'Uzbek': 'uz',
                 'Venda': 've',
                 'Vietnamese': 'vi',
                 'Volapük': 'vo',
                 'Walloon': 'wa',
                 'Welsh': 'cy',
                 'Western Frisian': 'fy',
                 'Wolof': 'wo',
                 'Xhosa': 'xh',
                 'Yiddish': 'yi',
                 'Yoruba': 'yo',
                 'Zhuang': 'za',
                 'Chuang': 'za',
                 'Zulu': 'zu'
                 }


def convert(isoType, langName):
    if isoType == '639-1' or isoType == '1' or isoType == 1:
        return str2iso_639_1[langName]