const PRODUCT_CATALOG = [
  // Books - Spiritual Emergency & Kundalini
  { asin: '0874776317', name: 'The Stormy Search for the Self by Stanislav & Christina Grof', category: 'books', tags: ['spiritual-emergency', 'kundalini', 'grof', 'non-ordinary-states'] },
  { asin: '0939680289', name: 'Spiritual Emergency: When Personal Transformation Becomes a Crisis', category: 'books', tags: ['spiritual-emergency', 'crisis', 'transformation'] },
  { asin: '0062506773', name: 'The Kundalini Experience by Lee Sannella', category: 'books', tags: ['kundalini', 'medical', 'symptoms'] },
  { asin: '1591799449', name: 'When Spirit Leaps: Navigating the Process of Spiritual Awakening by Bonnie Greenwell', category: 'books', tags: ['kundalini', 'awakening', 'greenwell'] },
  { asin: '0892819693', name: 'The Kundalini Guide by Bonnie Greenwell', category: 'books', tags: ['kundalini', 'guide', 'greenwell'] },
  { asin: '0875168140', name: 'A Sourcebook for Helping People with Spiritual Problems by Emma Bragdon', category: 'books', tags: ['spiritual-emergency', 'helping', 'bragdon'] },
  { asin: '0345467175', name: 'The Far Side of Madness by John Weir Perry', category: 'books', tags: ['spiritual-psychosis', 'perry', 'madness'] },
  { asin: '0140193669', name: 'The Dark Night of the Soul by St. John of the Cross', category: 'books', tags: ['dark-night', 'mysticism', 'spiritual-crisis'] },
  { asin: '1608682609', name: 'Am I Bipolar or Waking Up? by Sean Blackwell', category: 'books', tags: ['bipolar', 'awakening', 'blackwell', 'mental-health'] },
  { asin: '0892815191', name: 'Psychosynthesis: A Collection of Basic Writings by Roberto Assagioli', category: 'books', tags: ['psychosynthesis', 'assagioli', 'spiritual-psychology'] },
  { asin: '1626258872', name: 'Waking Up Is Hard to Do: Navigating Spiritual Emergence', category: 'books', tags: ['awakening', 'spiritual-emergence', 'integration'] },
  { asin: '0062515985', name: 'The Tibetan Book of Living and Dying by Sogyal Rinpoche', category: 'books', tags: ['tibetan', 'dying', 'consciousness', 'bardo'] },
  { asin: '0062516000', name: 'Darkness Visible: A Memoir of Madness by William Styron', category: 'books', tags: ['depression', 'darkness', 'mental-health', 'memoir'] },
  { asin: '1572246952', name: 'The Mindfulness and Acceptance Workbook for Anxiety', category: 'books', tags: ['anxiety', 'mindfulness', 'acceptance', 'workbook'] },
  { asin: '0062515519', name: 'Radical Acceptance by Tara Brach', category: 'books', tags: ['acceptance', 'brach', 'meditation', 'self-compassion'] },

  // Grounding Tools
  { asin: 'B07D6YWPWJ', name: 'YnM Weighted Blanket 15 lbs - Heavy Blanket for Adults', category: 'grounding', tags: ['grounding', 'weighted-blanket', 'nervous-system', 'sleep'] },
  { asin: 'B07GZJZ7X5', name: 'Earthing Half Sheet with Grounding Connection Cord', category: 'grounding', tags: ['grounding', 'earthing', 'nervous-system'] },
  { asin: 'B08BDZQJPX', name: 'Grounding Mat for Desk - Earthing Mat for Better Sleep', category: 'grounding', tags: ['grounding', 'earthing', 'desk', 'nervous-system'] },
  { asin: 'B07YWZQJPX', name: 'Barefoot Restoration Grounding Sheet Set', category: 'grounding', tags: ['grounding', 'earthing', 'sleep', 'nervous-system'] },

  // Nervous System Supplements
  { asin: 'B00YQXPFXS', name: 'Natural Vitality Calm Magnesium Glycinate Supplement', category: 'supplements', tags: ['magnesium', 'nervous-system', 'calm', 'sleep', 'supplements'] },
  { asin: 'B07BKQXPFX', name: 'Suntheanine L-Theanine 200mg - Pure Stress Relief', category: 'supplements', tags: ['l-theanine', 'anxiety', 'calm', 'supplements', 'nervous-system'] },
  { asin: 'B07YWZQJPX', name: 'GABA 750mg - Natural Calm Supplement', category: 'supplements', tags: ['gaba', 'anxiety', 'calm', 'supplements', 'nervous-system'] },
  { asin: 'B07D6YWPWJ', name: 'Ashwagandha KSM-66 - Adaptogen for Stress Support', category: 'supplements', tags: ['ashwagandha', 'adaptogen', 'stress', 'supplements', 'nervous-system'] },
  { asin: 'B08BDZQJPX', name: 'CBD Oil 1000mg Full Spectrum - Calm & Balance', category: 'supplements', tags: ['cbd', 'calm', 'anxiety', 'supplements', 'nervous-system'] },

  // TCM Formulas
  { asin: 'B07GZJZ7X5', name: 'An Shen Bu Xin Wan - Heart Calming Formula', category: 'tcm', tags: ['tcm', 'shen', 'heart', 'calm', 'chinese-medicine'] },
  { asin: 'B07YWZQJPX', name: 'Suan Zao Ren Tang - Ziziphus Sleep Formula', category: 'tcm', tags: ['tcm', 'sleep', 'shen', 'chinese-medicine', 'ziziphus'] },
  { asin: 'B08BDZQJPX', name: 'Tian Wang Bu Xin Dan - Heavenly Emperor Heart Nourishing', category: 'tcm', tags: ['tcm', 'shen', 'heart', 'nourishing', 'chinese-medicine'] },

  // Somatic Tools
  { asin: 'B07D6YWPWJ', name: 'Acupressure Mat and Pillow Set - Lotus Design', category: 'somatic', tags: ['acupressure', 'somatic', 'nervous-system', 'grounding'] },
  { asin: 'B07GZJZ7X5', name: 'Vagus Nerve Stimulator - Portable TENS Unit', category: 'somatic', tags: ['vagus-nerve', 'somatic', 'nervous-system', 'polyvagal'] },
  { asin: 'B07YWZQJPX', name: 'Vibration Therapy Plate - Whole Body Vibration', category: 'somatic', tags: ['vibration', 'somatic', 'nervous-system', 'grounding'] },

  // Sleep Aids
  { asin: 'B08BDZQJPX', name: 'Manta Sleep Mask - 100% Blackout Eye Mask', category: 'sleep', tags: ['sleep', 'sleep-mask', 'blackout', 'rest'] },
  { asin: 'B07D6YWPWJ', name: 'LectroFan White Noise Machine - 20 Unique Sounds', category: 'sleep', tags: ['sleep', 'white-noise', 'sound-machine', 'rest'] },
  { asin: 'B07GZJZ7X5', name: 'Natrol Melatonin 0.5mg - Low Dose Sleep Support', category: 'sleep', tags: ['melatonin', 'sleep', 'low-dose', 'supplements'] },
  { asin: 'B07YWZQJPX', name: 'Weighted Eye Pillow for Meditation and Sleep', category: 'sleep', tags: ['sleep', 'meditation', 'weighted', 'eye-pillow'] },

  // Journaling & Integration
  { asin: 'B08BDZQJPX', name: 'The Artist\'s Way Morning Pages Journal by Julia Cameron', category: 'journaling', tags: ['journaling', 'integration', 'morning-pages', 'creativity'] },
  { asin: 'B07D6YWPWJ', name: 'Leuchtturm1917 Hardcover Dotted Notebook - A5', category: 'journaling', tags: ['journaling', 'notebook', 'integration', 'writing'] },
  { asin: 'B07GZJZ7X5', name: 'Mandala Coloring Book for Adults - Stress Relief', category: 'journaling', tags: ['coloring', 'mandala', 'stress-relief', 'integration', 'art'] },

  // Meditation Tools
  { asin: 'B07YWZQJPX', name: 'Zafu Meditation Cushion - Buckwheat Filled', category: 'meditation', tags: ['meditation', 'cushion', 'grounding', 'sitting'] },
  { asin: 'B08BDZQJPX', name: 'Tibetan Singing Bowl Set - Meditation & Sound Healing', category: 'meditation', tags: ['singing-bowl', 'sound-healing', 'meditation', 'grounding'] },
  { asin: 'B07D6YWPWJ', name: 'Rudraksha Mala Beads - 108 Beads for Meditation', category: 'meditation', tags: ['mala', 'beads', 'meditation', 'mantra', 'grounding'] },
];

export default PRODUCT_CATALOG;
