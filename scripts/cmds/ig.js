module.exports.config = {
  name: "ig",
  version: "1.0",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Islamic random post",
  category: "fun",
  usePrefix: false,
  usages: "{p}"
};

module.exports.onChat = async ({ bot, event }) => {
  const text = event.text?.trim() || "";
  const prefix = global.config.prefix;

  if (text !== prefix) return;

  try {
    const captions = [
      "আপনি কত শিক্ষিত তা গুরুত্বপূর্ণ নয়, আপনার চরিত্র কতো উন্নত তাই বেশী গুরুত্বপূর্ণ",
 
"যে ভুল স্বীকার করে সে কখনো ছোট হয় না। তার সম্মান আরো বেড়ে যায়",
 
"আজ আপনি যে ছেলে/মেয়েটার সাথে হারাম সম্পর্কে লিপ্ত আছেন বিচারদিবসে সে-ই আপনার বিরুদ্ধে সাক্ষ্য দিবে। ",
 
"জীবনে যদি বারবার পড়ে যান তবে পথ তাকে বদলান, স্বপ্নটাকে নয়। কারণ গাছ তার পাতা বদলায়, জায়গা নয়",
 
"শুধু নিজের জন্য আনন্দ খুঁজলে কখনো পাবে না তুমি। যদি সবাইকে আনন্দ দেওয়ার চেষ্টা করো, তাহলে আনন্দ তোমার কাছে এসে ধরা দেবে",
 
"তুমি অপরের যত ক্ষতি চাইবে, তার চেয়ে বেশী তুমি নিজেই ক্ষতির সম্মুখীন হইবে",
 
"পৃথিবীতে বেঁচে থাকতে হলে প্রতি পদে পদে মায়াকে তুচ্ছ করতে হয়",
 
"পৃথিবী অনেক সুন্দর হয় যদি সুন্দর চোখে দেখা যায়। জীবন অনেক সহজ হবে যদি তা তুমি সহজে গ্রহণ করো",
 
"জীবনকে নিয়ে কখনো হতাশ হয়ো না। কে জানে হয়তো তোমার মতো এই জীবন পাওয়া অনেক মানুষের কাছে এক স্বপ্নের মতো",
 
"নিজেকে এমন ভাবে সাজিয়ে নাও, যাতে যারা তোমার একা করে গেছে তারাই তোমাকে দেখে একদিন আফসোস করে",
 
"আজ আপনি যে ছেলে/মেয়েটার সাথে হারাম সম্পর্কে লিপ্ত আছেন বিচারদিবসে সে-ই আপনার বিরুদ্ধে সাক্ষ্য দিবে। ",
 
"সৎ পথে করিও ভ্রমন যদিও হয় দেরি। অসৎ নারীকে করিও না বিয়ে যদিও হয় সে পরী",
 
"কাউকে কখনো ছোট ভেবো না। একটা কথা সবসময় মনে রাখবে, 5 টাকা দামের পেল কিন্তু পাঁচ কোটি টাকার চেক লেখার কাজে লাগে",
 
"তর্কে জেতা বুদ্ধিমানের কাজ নয় বরং তর্কে না যাওয়াই বুদ্ধিমানের কাজ",
 
"অন্ধ সে নয় যে দেখতে পায় না চোখে। অন্ধ তো সেই, যে নিজের দোষকে লুকায়",
 
"জীবনে পয়সা নয় ব্যবহারটা অনেক বড়, কারণ শ্মশানে 4 কোটি টাকা নয়, 4 জন মানুষই তোমাকে ছাড়তে আসবে",
 
"আজ আপনি যে ছেলে/মেয়েটার সাথে হারাম সম্পর্কে লিপ্ত আছেন বিচারদিবসে সে-ই আপনার বিরুদ্ধে সাক্ষ্য দিবে। ",
 
"জন্ম নেওয়া ভাগ্যের ব্যাপার, মৃত্যু হওয়া সময়ের ব্যাপার, কিন্তু মৃত্যুর পরেও মানুষের মনে বেঁচে থাকা কর্মের ব্যাপার",
 
"কোটি টাকার হীরেকে খুঁজতে একটাকার মোমবাতিটা কাজে লাগে। সুতরাং জীবনে কোনদিন কাউকে ছোট মনে করো না",
 
"মানুষকে জোর করে পরাধীনতার শিকলে বন্দি করা গেলেও, মানুষের মনের স্বাধীনতা হরন করার সাধ্য কারোও নেই। আকাশের মতোই মনের স্বাধীনতা সর্বব্যাপী",
 
"খাবার যতো দামী হোক- পচে গেলে যেমন তার কোন দাম থাকে না, তেমনি একটা মানুষ যতোই শিক্ষিত হোক না কেন মনুষ্যত্ব না থাকলে তার কোন দাম নেই",
 
"শক্তিশালী সেই ব্যক্তি নয় যে খুব কুস্তি লড়তে পারে। বরং শক্তিশালী হচ্ছে সেই ব্যক্তি, যিনি ক্রোধের সময় নিজেকে সংযত রাখতে পারে",
 
"দেহের সৌন্দর্যের চেয়ে মনের সৌন্দর্য হাজার গুনে শ্রেষ্ঠ",
 
"জীবনকে এক লম্বা যাত্রাপথ মনে করে এগিয়ে যাও। তোমার উদ্দেশ্য ঠিক থাকলে একদিন সঠিক পথের সন্ধান পাবে",
 
"যে ব্যক্তি পরিশ্রমের দ্বারা ধন সম্পত্তি অর্জন করে সে ব্যক্তি বোঝে কষ্ট কি। কিন্তু যে ব্যক্তি বিনা পরিশ্রমে সবকিছু পেয়ে যায়, সে জানেনা জীবনের বাস্তবতা কি",
 
"কলম যতোই দামী হোক ভিতরে কালি না থাকলে যেমন তা মূল্যহীন, ঠিক তেমনি মানুষ যতোই শিক্ষিত হোক না কেন, মনুষ্যত্ব না থাকলে সে শিক্ষা মূল্যহীন",
 
"তর্কের চেয়ে নীরবতা ভালো, প্রতিশোধ নেওয়ার চেয়ে রাস্তা বদলে ফেলা ভালো, আর স্বার্থপর মানুষের পাশে চলার চেয়ে একা চলা অনেক ভালো",
 
"জীবনে খারাপ সময় আসবে। আর সেই সময়টার সাথে লড়াই করে নিজেকে টিকিয়ে রাখতে হবে",
 
"নিজের জীবনের লড়াইটা নিজেকে লড়তে হবে। জ্ঞান অনেকেই দেবে কিন্তু সঙ্গ কেউ দেবে না",
 
"আপনার দুর্বলতাকে শক্তিতে পরিণত করার ক্ষমতা একমাত্র আল্লাহ্ তা'আলা-ই রাখেন। তাই তাঁর কাছেই প্রার্থনা করুন",
 
"নিশ্চয়ই আল্লাহ তা'আলা তাঁকে নিরবে ডেকে যাওয়া বান্দাদের হতাশ করেন না",
 
"কখনো কখনো মানুষ আপনাকে বয়কট করবে, দূরে সরিয়ে দিবে, তবে এগুলোকে পার্সোনালি নিয়ে ভেঙ্গে পড়বেন না। কারণ আল্লাহ সুবহানাহু তা'আলা হয়তো ওদের দিক থেকে দূরে সরিয়ে তাঁর নিজের দিকেই আপনাকে ডাকছেন",
 
"কথা বলা যদি রূপা হয় তবে নীরব থাকা হচ্ছে সোনা। - [লুকমান (আ:)]",
 
"আল্লাহর কাছে আপনি প্রার্থনা করা বন্ধ করে দিলে তিনি রাগান্বিত হন। অথচ আদম সন্তানের কাছে কিছু প্রার্থনা করলে সে রেগে যায়",
 
"যে বিষয়ে মনে খটকা লাগে সে বিষয়টা যতোটা সম্ভব এড়িয়ে চলুন",
 
"এমন কারো সঙ্গী হোন যে আপনাকে আল্লাহর কথা স্মরণ করিয়ে দেয়", 
 
"যদি কেউ আপনার প্রভুর আনুগত্য পছন্দ না করে তবে আপনারও তাকে পছন্দ করার কোন যুক্তি নেই",
 
"যখন পৃথিবীর কেউ আপনাকে বুঝতে চেষ্টা করে না, তখন এতটুকু মনে রাখুন আল্লাহ্ আপনাকে বুঝেন",
 
"নিজেকে দুশ্চিন্তামুক্ত রাখতে প্রতিটা বিষয়ে আল্লাহর উপর ভরসা করুন। কেননা আপনার জন্য কোনটি কল্যাণকর তা তিনিই ভালো জানেন। ",
 
"যখন আপনি কুরআন তিলাওয়াত করেন তখন মনে করবেন আপনি আল্লাহর সাথে কথোপকথন করছেন এবং তিনি সরাসরি আপনাকে বলছেন",
 
"আপনি যদি চান আল্লাহ্ আপনার সবগুলো পছন্দনীয় কাজ গ্রহণ করুন, তাহলে আপনি আল্লাহর পছন্দনীয় কাজগুলোই করতে থাকুন। ",
 
"দ্বীন ও দুনিয়া একসাথে অর্জন করতে কুরআন ও সুন্নাহ্ ব্যতীত অন্য কোন পথ নেই। যদিও মনে হবে দুনিয়া অপূর্ণই থেকে যাচ্ছে। ",
 
"অন্যকে দাওয়াত দিতে গিয়ে নিজেকে ভুলে যাবেন না। কারণ পরিবর্তন নিজেকে দিয়েই শুরু করতে হয়",
 
"মানুষের খারাপ দিক খোঁজা বন্ধ করুন৷ তাদের ভুলগুলো সহজভাবে গ্রহণ করুন৷ তাদের সাথে ধৈর্যশীল হোন৷ পরিষ্কার একটি হৃদয়ের জন্য সংগ্রাম করুন এবং তাদের ভেতরের ভালটা দেখুন৷",
 
"সর্বশক্তিমান কখনোই ঐ ব্যক্তির ভুল প্রকাশ করবেন না যে মানুষের সম্পর্কে খারাপ কথা বলা থেকে বিরত থাকে। তাই অন্যের পাপ প্রকাশ করা বন্ধ করুন",
 
"আমাদের জীবনে করা বড় ভুল কখনও কখনও আমাদেরকে পরিবর্তন করে দেয় সবচেয়ে ভালো মানুষে",
 
"মাঝে মাঝে দুঃখের দ্বারা আমারা এমনভাবে দগ্ধ হই যে আমারা ভুলেই যাই এমন অনেক বিষয়, যা আমাদের সুখী করতে পারে। কিছু সময় নিয়ে সেগুলো সম্পর্কে চিন্তা করুন",
 
"সন্ত্রাসবাদ কখনোই কোন ধর্মীয় অধিকার নয়। আর ইসলাম সবসময়ই সাধারণ মানুষ হত্যাকে ঘৃণা করে। তাই কেউ চাইলেই এসব হত্যাকান্ডকে ইসলামাইজ করতে পারে না। -[ডা. জাকির নায়িক]",
 
"আপনার পাপগুলো আল্লাহর দয়া থেকে বড় নয়",
 
"আপনি যদি আপনার মূল্য সঠিকভাবে বুঝতেন, তাহলে কখনো ইচ্ছাকৃতভাবে পাপ কর্মে লিপ্ত হতেন না ",
 
"কি চমৎকার একটি সম্পর্ক- আমরা আল্লাহ্ তা'আলা কে স্মরণ করলে তিনিও আমাদের স্মরণ করেন",
 
"সুন্দর চেহারা নিয়ে অহংকার করো না। তোমার মৃত্যুর পর যে তোমাকে ছোঁবে সেও স্থান করে নেবে।"
    ];

    const links = [
      "https://i.postimg.cc/N0H0Y2Dh/3d-rendering-islamic-pilgrimage-mosque-437476-72.webp",
 
"https://i.postimg.cc/xTfqHCfH/courtyard-kalyan-mosque-sunset-bukhara-uzbekistan-196911-7.webp",
 
"https://i.postimg.cc/jjwD5FsF/arabic-lamp-with-colorful-light-with-fog-background-9083-5636.webp",
 
"https://i.postimg.cc/52tYctD1/arabic-lantern-with-burning-candle-566707-1993.webp",
 
"https://i.postimg.cc/pXCh1jGq/great-mosque-hassan-2-sunset-casablanca-morocco-beautiful-arches-arab-mosque-sunset-sunlight-rays-86.webp",
 
"https://i.postimg.cc/6QgGfNjK/lamp-mat-near-quran-23-2147868927.jpg", 
 
"https://i.postimg.cc/g2cRYsXC/blue-mosque-istanbul-1157-8841.webp",
 
"https://i.postimg.cc/85xBcvQh/muslim-boy-having-worship-praying-fasting-eid-islamic-culture-mosque-73899-1334.webp",
 
"https://i.postimg.cc/66kqj0fr/quran-4178664-1920.jpg",
 
"https://i.postimg.cc/FR1XmMNY/cami-1819673-1920.jpg",
 
"https://i.postimg.cc/tgqHv1ct/islamic-3710002-1920.jpg",
 
"https://i.postimg.cc/4y7GvrSD/lantern-5224200-1280.png",
 
"https://i.postimg.cc/FKN9tCYS/moon-light-shine-through-window-into-islamic-mosque-interior.jpg",
 
"https://i.postimg.cc/3RrJGf7h/top-view-islamic-new-year-concept.jpg",
 
"https://i.postimg.cc/FKN9tCYS/moon-light-shine-through-window-into-islamic-mosque-interior.jpg",
 
"https://i.postimg.cc/3RrJGf7h/top-view-islamic-new-year-concept.jpg",
 
"https://i.postimg.cc/BQbLk6r3/quran-open-wooden-placemat-with-mountain-view-background-9083-5767.webp",
 
"https://i.postimg.cc/cHWtbcSk/koran-holy-book-muslims-public-item-all-muslims-table-44074-490.webp",
 
"https://i.postimg.cc/Y2b8QvNB/pexels-konevi-2475746.jpg",
 
"https://i.postimg.cc/yxYPwKHG/pexels-francesco-ungaro-206066.jpg",
 
"https://i.postimg.cc/WbYWcdtw/pexels-ali-burhan-7261977.jpg",
 
"https://i.postimg.cc/FRbWMGJY/quran-g814c33c12-1920.jpg",
 
"https://i.postimg.cc/bwd5ZQ45/muslim-7059888-1280.png",
 
"https://i.postimg.cc/QCbzTSX2/birds-5407779-1920.jpg",
 
"https://i.postimg.cc/W30C2Txb/praise-be-to-god-2070011-1920.jpg",
 
"https://i.postimg.cc/Bnwdphxs/ramadan-3384043-1920.jpg",
 
"https://i.postimg.cc/28nFjTkG/pexels-pixabay-161153.jpg",
 
"https://i.postimg.cc/Df9PKRTm/pexels-rodnae-productions-7249191.jpg",
 
"https://i.postimg.cc/sX89xNG6/pexels-michael-burrows-7129734.jpg",
 
"https://i.postimg.cc/fbzvrXhK/pexels-rodnae-productions-7249738.jpg",
 
"https://i.postimg.cc/JzWxjv6S/pexels-thirdman-8489273.jpg",
 
"https://i.postimg.cc/05Fcybpk/pexels-oleksandr-pidvalnyi-323340.jpg",
 
"https://i.postimg.cc/7h26PGwJ/pexels-pixabay-326716.jpg",
 
"https://i.postimg.cc/yNLWLCLx/pexels-pavlo-luchkovski-337897.jpg",
 
"https://i.postimg.cc/g2W9rMv2/pexels-abdulmeilk-aldawsari-36704.jpg",
 
"https://i.postimg.cc/ZYWzQvb4/pexels-ahmed-aqtai-2233416.jpg",
 
"https://i.postimg.cc/yNjL1jTt/pexels-konevi-2236674.jpg",
 
"https://i.postimg.cc/k5qjPzWW/pexels-haydan-assoendawy-2895295.jpg",
 
"https://i.postimg.cc/KjwqXY5Y/pexels-pixabay-161276.jpg",
 
"https://i.postimg.cc/wM7fbNLP/pexels-konevi-2830460.jpg",
 
"https://i.postimg.cc/1zQd5f1n/pexels-oliver-sj-str-m-1122407.jpg",
 
"https://i.postimg.cc/cHctdpmG/photo-1596193433486-02333accdc13-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/2SqWnXzn/photo-1584551246679-0daf3d275d0f-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/VLZMrccY/photo-1617352418652-ffe852c236cf-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/gkzqLDXK/photo-1601191362988-ac6ebec629c8-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/GtYNBj4R/photo-1586767003402-8ade266deb64-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/kXfJ7xtZ/photo-1605976528013-638e49b6599f-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/d39qkCNh/photo-1587617425953-9075d28b8c46-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/JnpmcXCv/photo-1618383406944-0df8186c3aff-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/nVdcqyHr/photo-1455620611406-966ca6889d80-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/DZ6fjDLC/photo-1519817650390-64a93db51149-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/htQjD2Rj/photo-1624489389801-09bb319beae6-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/rFPs2vb3/photo-1624862300786-fcdbd20ba0c3-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/d1YDSrX0/photo-1616777156138-0c18fd11fbb2-crop-faces-edges-cs-tinysrgb-fit-crop-fm-jpg-ixid-Mnwx-Mj-A3f-DB8-MXxhb.jpg",
 
"https://i.postimg.cc/6q3gJgJM/pexels-fuzail-ahmad-2344997.jpg"
    ];

    const i = Math.floor(Math.random() * captions.length);

    await bot.sendPhoto(event.chat.id, links[i], {
      caption: captions[i],
      reply_to_message_id: event.message_id
    });

  } catch (err) {
    console.log(err);
  }
};
