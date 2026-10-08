export const elevenwardLocales = ["en", "es", "pt-br", "fr"] as const;
export type ElevenwardLocale = (typeof elevenwardLocales)[number];

export function isElevenwardLocale(value: string): value is ElevenwardLocale {
  return elevenwardLocales.includes(value as ElevenwardLocale);
}

export function elevenwardLanguageTag(locale: ElevenwardLocale): string {
  return locale === "pt-br" ? "pt-BR" : locale;
}

type Copy = {
  language: string;
  title: string;
  subtitle: string;
  intro: string;
  primaryAction: string;
  secondaryAction: string;
  appStoreAction: string;
  updateNotice: string;
  purchaseTitle: string;
  purchases: Array<[string, string]>;
  purchaseNote: string;
  pillars: Array<[string, string]>;
  loopTitle: string;
  loop: string[];
  worldTitle: string;
  worldBody: string;
  promiseTitle: string;
  promiseBody: string;
  supportTitle: string;
  supportBody: string;
  privacyTitle: string;
  privacyBody: string;
  deletionTitle: string;
  deletionBody: string;
  pressTitle: string;
  pressBody: string;
};

export const elevenwardCopy: Record<ElevenwardLocale, Copy> = {
  en: {
    language: "English",
    title: "Every week moves a life forward.",
    subtitle: "Football Career & Life RPG",
    intro: "Begin at 17. Earn your place, read the match, own the moments that matter, and live with everything football changes away from the pitch.",
    primaryAction: "See the career",
    secondaryAction: "Contact support",
    appStoreAction: "Download on the App Store",
    updateNotice: "Coming in version 1.1: an expanded football world. This update is being prepared for App Review and is not yet available.",
    purchaseTitle: "Version 1.1 permanent pass benefits.",
    purchases: [
      ["VIP Starter Pack", "1.5× weekly development and positive income, five career slots, and premium cosmetics."],
      ["2× Development", "Doubles weekly training development, including fractional gains. Stacks with VIP for 3× development."],
      ["2× Money", "Doubles positive wages, appearance fees, sponsors, and event income. Stacks with VIP for 3× positive income."],
      ["All-Access Pass", "Includes VIP, 2× Development, and 2× Money: 3× weekly development and positive income, five career slots, and premium cosmetics."],
    ],
    purchaseNote: "Every pass is optional and permanent. The Shop shows your storefront’s current price. Restore purchases through More → Shop → Restore purchases using the same storefront account. An internet connection is required for purchases and account features.",
    pillars: [
      ["Your football", "Four positions, twelve archetypes, and eight visible attributes. Every outcome shows its reasons."],
      ["Your world", "The version 1.1 world spans 48 countries, with promotion, cups, international nights, and national-team call-ups."],
      ["Your life", "Contracts, agents, teammates, family, sponsors, wellness, style, homes, and community choices."],
      ["Your legacy", "Play offline from age 17 to retirement and leave behind a career verdict built from the whole story."],
    ],
    loopTitle: "One week. One chain of consequences.",
    loop: ["Choose a focus", "Read selection and matchup", "Own a spotlight decision", "Understand the result", "Handle life away from football", "Advance the world"],
    worldTitle: "Version 1.1: a wider football world.",
    worldBody: "The upcoming version 1.1 includes 520 fictional clubs across 52 leagues in 48 countries, plus 48 national teams. Follow domestic cups, promotion and relegation, and international competition with original club and player identities.",
    promiseTitle: "The full career is free.",
    promiseBody: "Play the complete regular career offline without an account or a purchase. There are no ads, subscriptions, energy timers, premium currency, or loot boxes. Optional permanent passes add clearly shown development and positive-income boosts, extra career slots, and cosmetics.",
    supportTitle: "Elevenward support",
    supportBody: "For installation, careers, purchases, cloud saves, accessibility, or account help, email howethstudio@gmail.com with your app version, device, and the shortest steps that reproduce the issue.",
    privacyTitle: "Privacy by design",
    privacyBody: "Guest career saves stay on your device. Optional accounts support cloud saves and online features. Feedback, purchases, and sharing are described below. Elevenward does not request your address book, precise location, camera, microphone, advertising identifiers, or cross-app tracking data.",
    deletionTitle: "Delete your Elevenward account",
    deletionBody: "Use More → Account → Delete account in the app. This removes your server account and cloud data while retaining local careers. Local careers can be removed separately from Career Slots.",
    pressTitle: "Elevenward press kit",
    pressBody: "Elevenward is an original portrait-first football career and life RPG from Beopity. Play complete offline careers with optional account features and permanent development, income, save-slot, and cosmetic upgrades.",
  },
  es: {
    language: "Español",
    title: "Cada semana hace avanzar una vida.",
    subtitle: "RPG de carrera y vida futbolística",
    intro: "Empieza con 17 años. Gánate un puesto, lee el partido, decide en los momentos clave y vive todo lo que el fútbol cambia fuera del campo.",
    primaryAction: "Ver la carrera",
    secondaryAction: "Contactar con soporte",
    appStoreAction: "Descargar en el App Store",
    updateNotice: "Próximamente en la versión 1.1: un mundo futbolístico más amplio. La actualización se está preparando para la revisión de Apple y aún no está disponible.",
    purchaseTitle: "Ventajas de los pases en la versión 1.1.",
    purchases: [
      ["Pack Inicial VIP", "1,5× desarrollo semanal e ingresos positivos, cinco espacios de carrera y cosméticos prémium."],
      ["2× Desarrollo", "Duplica el desarrollo semanal del entrenamiento, incluidas las ganancias fraccionadas. Se combina con VIP para obtener 3× desarrollo."],
      ["2× Dinero", "Duplica salarios, primas por participación, patrocinios e ingresos positivos de eventos. Se combina con VIP para obtener 3× ingresos positivos."],
      ["Pase Acceso Total", "Incluye VIP, 2× Desarrollo y 2× Dinero: 3× desarrollo semanal e ingresos positivos, cinco espacios de carrera y cosméticos prémium."],
    ],
    purchaseNote: "Todos los pases son opcionales y permanentes. La Tienda muestra el precio actual de tu tienda. Restaura las compras en Más → Tienda → Restaurar compras con la misma cuenta de la tienda. Las compras y las funciones de cuenta requieren conexión a internet.",
    pillars: [
      ["Tu fútbol", "Cuatro posiciones, doce arquetipos y ocho atributos visibles. Cada resultado explica sus razones."],
      ["Tu mundo", "El mundo de la versión 1.1 abarca 48 países, con ascensos, copas, noches internacionales y convocatorias nacionales."],
      ["Tu vida", "Contratos, agentes, compañeros, familia, patrocinadores, bienestar, estilo, hogares y comunidad."],
      ["Tu legado", "Juega sin conexión desde los 17 años hasta la retirada y deja un veredicto sobre toda tu historia."],
    ],
    loopTitle: "Una semana. Una cadena de consecuencias.",
    loop: ["Elige un enfoque", "Revisa selección y rival", "Decide en un momento clave", "Comprende el resultado", "Gestiona la vida fuera del campo", "Haz avanzar el mundo"],
    worldTitle: "Versión 1.1: un mundo futbolístico más amplio.",
    worldBody: "La próxima versión 1.1 incluye 520 clubes ficticios repartidos en 52 ligas de 48 países, además de 48 selecciones nacionales. Sigue copas, ascensos, descensos y competiciones internacionales con clubes y jugadores originales.",
    promiseTitle: "La carrera completa es gratuita.",
    promiseBody: "Juega toda la carrera normal sin conexión, sin cuenta y sin compras. No hay anuncios, suscripciones, límites de energía, moneda prémium ni cajas de botín. Los pases permanentes opcionales añaden mejoras claras del desarrollo y los ingresos positivos, espacios de carrera y cosméticos.",
    supportTitle: "Soporte de Elevenward",
    supportBody: "Para ayuda con instalación, carreras, compras, nube, accesibilidad o cuenta, escribe a howethstudio@gmail.com con la versión, el dispositivo y los pasos del problema.",
    privacyTitle: "Privacidad desde el diseño",
    privacyBody: "Las partidas de invitado permanecen en el dispositivo. Las cuentas opcionales permiten guardar en la nube y usar funciones en línea. Los comentarios, compras y opciones de compartir se describen abajo. No solicitamos tu agenda, ubicación precisa, cámara, micrófono ni identificadores publicitarios.",
    deletionTitle: "Eliminar tu cuenta de Elevenward",
    deletionBody: "Usa Más → Cuenta → Eliminar cuenta en la app. Se borrarán la cuenta del servidor y los datos en la nube, conservando las carreras locales. Puedes borrarlas por separado en Espacios de carrera.",
    pressTitle: "Kit de prensa de Elevenward",
    pressBody: "Elevenward es un RPG original de carrera y vida futbolística de Beopity, diseñado para jugar sin conexión con funciones opcionales en la nube.",
  },
  "pt-br": {
    language: "Português do Brasil",
    title: "Cada semana faz uma vida avançar.",
    subtitle: "RPG de carreira e vida no futebol",
    intro: "Comece aos 17. Conquiste seu lugar, leia a partida, decida nos grandes momentos e viva tudo que o futebol muda fora de campo.",
    primaryAction: "Ver a carreira",
    secondaryAction: "Falar com o suporte",
    appStoreAction: "Baixar na App Store",
    updateNotice: "Em breve na versão 1.1: um mundo do futebol mais amplo. A atualização está sendo preparada para análise da Apple e ainda não está disponível.",
    purchaseTitle: "Benefícios dos passes na versão 1.1.",
    purchases: [
      ["Pacote Inicial VIP", "1,5× desenvolvimento semanal e renda positiva, cinco espaços de carreira e cosméticos premium."],
      ["2× Desenvolvimento", "Dobra o desenvolvimento semanal dos treinos, incluindo ganhos fracionados. Combina com VIP para chegar a 3× desenvolvimento."],
      ["2× Dinheiro", "Dobra salários, pagamentos por participação, patrocínios e renda positiva de eventos. Combina com VIP para chegar a 3× renda positiva."],
      ["Passe Acesso Total", "Inclui VIP, 2× Desenvolvimento e 2× Dinheiro: 3× desenvolvimento semanal e renda positiva, cinco espaços de carreira e cosméticos premium."],
    ],
    purchaseNote: "Todos os passes são opcionais e permanentes. A Loja mostra o preço atual da sua loja. Restaure compras em Mais → Loja → Restaurar compras com a mesma conta da loja. Compras e recursos de conta precisam de internet.",
    pillars: [
      ["Seu futebol", "Quatro posições, doze arquétipos e oito atributos visíveis. Todo resultado mostra seus motivos."],
      ["Seu mundo", "O mundo da versão 1.1 abrange 48 países, com acesso, copas, noites internacionais e convocações para a seleção."],
      ["Sua vida", "Contratos, agentes, colegas, família, patrocinadores, bem-estar, estilo, casas e comunidade."],
      ["Seu legado", "Jogue offline dos 17 anos até a aposentadoria e deixe um veredito construído por toda a história."],
    ],
    loopTitle: "Uma semana. Uma cadeia de consequências.",
    loop: ["Escolha um foco", "Veja escalação e adversário", "Decida um momento-chave", "Entenda o resultado", "Cuide da vida fora de campo", "Faça o mundo avançar"],
    worldTitle: "Versão 1.1: um mundo do futebol mais amplo.",
    worldBody: "A próxima versão 1.1 inclui 520 clubes fictícios em 52 ligas de 48 países, além de 48 seleções. Acompanhe copas, acesso, rebaixamento e competições internacionais com clubes e jogadores originais.",
    promiseTitle: "A carreira completa é gratuita.",
    promiseBody: "Jogue a carreira normal completa offline, sem conta e sem compras. Não há anúncios, assinaturas, limite de energia, moeda premium ou caixas de itens. Passes permanentes opcionais oferecem bônus claros de desenvolvimento e renda positiva, espaços de carreira e cosméticos.",
    supportTitle: "Suporte do Elevenward",
    supportBody: "Para ajuda com instalação, carreiras, compras, nuvem, acessibilidade ou conta, envie um e-mail para howethstudio@gmail.com com versão, aparelho e passos do problema.",
    privacyTitle: "Privacidade desde o início",
    privacyBody: "Os saves de convidado ficam no aparelho. Contas opcionais permitem saves na nuvem e recursos online. Feedback, compras e compartilhamento estão descritos abaixo. Não solicitamos sua agenda, localização precisa, câmera, microfone ou identificadores de publicidade.",
    deletionTitle: "Excluir sua conta Elevenward",
    deletionBody: "Use Mais → Conta → Excluir conta no app. A conta do servidor e os dados na nuvem são removidos, preservando as carreiras locais. Você pode apagá-las separadamente em Espaços de carreira.",
    pressTitle: "Kit de imprensa do Elevenward",
    pressBody: "Elevenward é um RPG original de carreira e vida no futebol da Beopity, feito para carreiras offline completas com recursos opcionais na nuvem.",
  },
  fr: {
    language: "Français",
    title: "Chaque semaine fait avancer une vie.",
    subtitle: "RPG de carrière et de vie dans le football",
    intro: "Commencez à 17 ans. Gagnez votre place, lisez le match, décidez dans les moments clés et vivez tout ce que le football change hors du terrain.",
    primaryAction: "Voir la carrière",
    secondaryAction: "Contacter l’assistance",
    appStoreAction: "Télécharger dans l’App Store",
    updateNotice: "À venir dans la version 1.1 : un monde du football plus vaste. Cette mise à jour est en préparation pour l’examen d’Apple et n’est pas encore disponible.",
    purchaseTitle: "Avantages des pass dans la version 1.1.",
    purchases: [
      ["Pack Départ VIP", "1,5× progression hebdomadaire et revenus positifs, cinq emplacements de carrière et des cosmétiques premium."],
      ["2× Progression", "Double la progression hebdomadaire de l’entraînement, fractions comprises. Se combine avec VIP pour atteindre 3× progression."],
      ["2× Revenus", "Double salaires, primes de participation, sponsors et revenus positifs des événements. Se combine avec VIP pour atteindre 3× revenus positifs."],
      ["Pass Accès Total", "Inclut VIP, 2× Progression et 2× Revenus : 3× progression hebdomadaire et revenus positifs, cinq emplacements de carrière et des cosmétiques premium."],
    ],
    purchaseNote: "Tous les pass sont facultatifs et permanents. La Boutique affiche le prix actuel de votre boutique. Restaurez vos achats dans Plus → Boutique → Restaurer les achats avec le même compte de boutique. Les achats et fonctions de compte nécessitent internet.",
    pillars: [
      ["Votre football", "Quatre postes, douze archétypes et huit attributs visibles. Chaque résultat explique ses raisons."],
      ["Votre monde", "Le monde de la version 1.1 couvre 48 pays, avec montées, coupes, soirées internationales et sélections nationales."],
      ["Votre vie", "Contrats, agents, coéquipiers, famille, sponsors, bien-être, style, logement et communauté."],
      ["Votre héritage", "Jouez hors ligne de 17 ans à la retraite et laissez un verdict construit sur toute votre histoire."],
    ],
    loopTitle: "Une semaine. Une chaîne de conséquences.",
    loop: ["Choisir un objectif", "Lire la sélection et l’adversaire", "Décider dans un moment clé", "Comprendre le résultat", "Gérer la vie hors terrain", "Faire avancer le monde"],
    worldTitle: "Version 1.1 : un monde du football plus vaste.",
    worldBody: "La prochaine version 1.1 comprend 520 clubs fictifs dans 52 championnats de 48 pays, ainsi que 48 équipes nationales. Suivez coupes, montées, relégations et compétitions internationales avec des clubs et joueurs originaux.",
    promiseTitle: "La carrière complète est gratuite.",
    promiseBody: "Jouez toute la carrière normale hors ligne, sans compte ni achat. Aucune publicité, abonnement, limite d’énergie, monnaie premium ou loot box. Les pass permanents facultatifs ajoutent des bonus clairs de progression et de revenus positifs, des emplacements de carrière et des cosmétiques.",
    supportTitle: "Assistance Elevenward",
    supportBody: "Pour toute aide concernant l’installation, les carrières, achats, sauvegardes, l’accessibilité ou le compte, écrivez à howethstudio@gmail.com avec la version, l’appareil et les étapes du problème.",
    privacyTitle: "La confidentialité dès la conception",
    privacyBody: "Les sauvegardes invitées restent sur l’appareil. Les comptes facultatifs permettent sauvegardes cloud et fonctions en ligne. Commentaires, achats et partage sont décrits ci-dessous. Aucun accès au carnet d’adresses, à la localisation précise, à la caméra, au micro ou aux identifiants publicitaires.",
    deletionTitle: "Supprimer votre compte Elevenward",
    deletionBody: "Utilisez Plus → Compte → Supprimer le compte dans l’app. Le compte serveur et les données cloud sont supprimés, tandis que les carrières locales sont conservées. Supprimez-les séparément dans Emplacements de carrière.",
    pressTitle: "Kit presse Elevenward",
    pressBody: "Elevenward est un RPG original de carrière et de vie dans le football signé Beopity, conçu pour des carrières complètes hors ligne avec des fonctions cloud facultatives.",
  },
};

export type ElevenwardUiCopy = {
  skip: string;
  backToStudio: string;
  overview: string;
  career: string;
  world: string;
  fairPlay: string;
  support: string;
  privacy: string;
  press: string;
  deleteAccount: string;
  developmentStatus: string;
  platforms: string;
  scrollPrompt: string;
  careerEyebrow: string;
  careerTitle: string;
  loopEyebrow: string;
  worldEyebrow: string;
  promiseEyebrow: string;
  privacyAction: string;
  studioLine: string;
  stats: Array<[string, string]>;
  fairPoints: string[];
  preview: {
    week: string;
    minute: string;
    prompt: string;
    safe: string;
    safeChoice: string;
    balanced: string;
    balancedChoice: string;
    bold: string;
    boldChoice: string;
    factors: string[];
    commit: string;
  };
};

export const elevenwardUiCopy: Record<ElevenwardLocale, ElevenwardUiCopy> = {
  en: {
    skip: "Skip to main content",
    backToStudio: "Beopity home",
    overview: "Overview",
    career: "Career",
    world: "World",
    fairPlay: "Fair play",
    support: "Support",
    privacy: "Privacy",
    press: "Press",
    deleteAccount: "Delete account",
    developmentStatus: "Available on the App Store",
    platforms: "iPhone and iPad · Android in development",
    scrollPrompt: "Explore the career",
    careerEyebrow: "Your career, clearly told",
    careerTitle: "The whole football life, without the mystery.",
    loopEyebrow: "The weekly rhythm",
    worldEyebrow: "A living football world",
    promiseEyebrow: "Fair by design",
    privacyAction: "Read the privacy promise",
    studioLine: "An original game by Beopity",
    stats: [["4", "positions"], ["12", "archetypes"], ["20", "seasons maximum"], ["100%", "offline career"]],
    fairPoints: ["No ads", "No subscriptions", "No energy timers", "Optional permanent boosts"],
    preview: {
      week: "Week 7 of 18",
      minute: "67′ · Level at 1–1",
      prompt: "The ball drops at the edge of the box.",
      safe: "Lower risk",
      safeChoice: "Lay it off",
      balanced: "Balanced",
      balancedChoice: "Shift and shoot",
      bold: "Higher risk",
      boldChoice: "Hit it first time",
      factors: ["Technique 68", "Fitness 81", "Opponent −4"],
      commit: "Commit decision",
    },
  },
  es: {
    skip: "Saltar al contenido principal",
    backToStudio: "Inicio de Beopity",
    overview: "Resumen",
    career: "Carrera",
    world: "Mundo",
    fairPlay: "Juego limpio",
    support: "Soporte",
    privacy: "Privacidad",
    press: "Prensa",
    deleteAccount: "Eliminar cuenta",
    developmentStatus: "Disponible en el App Store",
    platforms: "iPhone y iPad · Android en desarrollo",
    scrollPrompt: "Explorar la carrera",
    careerEyebrow: "Tu carrera, contada con claridad",
    careerTitle: "Toda la vida del fútbol, sin misterios.",
    loopEyebrow: "El ritmo semanal",
    worldEyebrow: "Un mundo futbolístico vivo",
    promiseEyebrow: "Justo por diseño",
    privacyAction: "Leer la promesa de privacidad",
    studioLine: "Un juego original de Beopity",
    stats: [["4", "posiciones"], ["12", "arquetipos"], ["20", "temporadas máximo"], ["100%", "carrera sin conexión"]],
    fairPoints: ["Sin anuncios", "Sin suscripciones", "Sin límites de energía", "Mejoras permanentes opcionales"],
    preview: {
      week: "Jornada 7 de 18",
      minute: "67′ · Empate 1–1",
      prompt: "El balón cae al borde del área.",
      safe: "Menor riesgo",
      safeChoice: "Tocar de cara",
      balanced: "Equilibrado",
      balancedChoice: "Hacerse hueco y tirar",
      bold: "Mayor riesgo",
      boldChoice: "Rematar de primera",
      factors: ["Técnica 68", "Forma 81", "Rival −4"],
      commit: "Confirmar decisión",
    },
  },
  "pt-br": {
    skip: "Ir para o conteúdo principal",
    backToStudio: "Início da Beopity",
    overview: "Visão geral",
    career: "Carreira",
    world: "Mundo",
    fairPlay: "Jogo justo",
    support: "Suporte",
    privacy: "Privacidade",
    press: "Imprensa",
    deleteAccount: "Excluir conta",
    developmentStatus: "Disponível na App Store",
    platforms: "iPhone e iPad · Android em desenvolvimento",
    scrollPrompt: "Explorar a carreira",
    careerEyebrow: "Sua carreira, contada com clareza",
    careerTitle: "Toda a vida no futebol, sem mistério.",
    loopEyebrow: "O ritmo semanal",
    worldEyebrow: "Um mundo vivo do futebol",
    promiseEyebrow: "Justo desde o início",
    privacyAction: "Ler o compromisso de privacidade",
    studioLine: "Um jogo original da Beopity",
    stats: [["4", "posições"], ["12", "arquétipos"], ["20", "temporadas no máximo"], ["100%", "carreira offline"]],
    fairPoints: ["Sem anúncios", "Sem assinaturas", "Sem limite de energia", "Bônus permanentes opcionais"],
    preview: {
      week: "Rodada 7 de 18",
      minute: "67′ · Empate em 1–1",
      prompt: "A bola sobra na entrada da área.",
      safe: "Menor risco",
      safeChoice: "Tocar de lado",
      balanced: "Equilibrado",
      balancedChoice: "Abrir espaço e chutar",
      bold: "Maior risco",
      boldChoice: "Finalizar de primeira",
      factors: ["Técnica 68", "Preparo 81", "Adversário −4"],
      commit: "Confirmar decisão",
    },
  },
  fr: {
    skip: "Aller au contenu principal",
    backToStudio: "Accueil Beopity",
    overview: "Aperçu",
    career: "Carrière",
    world: "Monde",
    fairPlay: "Jeu équitable",
    support: "Assistance",
    privacy: "Confidentialité",
    press: "Presse",
    deleteAccount: "Supprimer le compte",
    developmentStatus: "Disponible dans l’App Store",
    platforms: "iPhone et iPad · Android en développement",
    scrollPrompt: "Explorer la carrière",
    careerEyebrow: "Votre carrière, racontée clairement",
    careerTitle: "Toute une vie de football, sans mystère.",
    loopEyebrow: "Le rythme hebdomadaire",
    worldEyebrow: "Un monde du football vivant",
    promiseEyebrow: "Équitable par conception",
    privacyAction: "Lire la promesse de confidentialité",
    studioLine: "Un jeu original de Beopity",
    stats: [["4", "postes"], ["12", "archétypes"], ["20", "saisons maximum"], ["100%", "carrière hors ligne"]],
    fairPoints: ["Sans publicité", "Sans abonnement", "Sans limite d’énergie", "Bonus permanents facultatifs"],
    preview: {
      week: "Journée 7 sur 18",
      minute: "67′ · Égalité 1–1",
      prompt: "Le ballon retombe à l’entrée de la surface.",
      safe: "Risque réduit",
      safeChoice: "Remettre le ballon",
      balanced: "Équilibré",
      balancedChoice: "Se décaler et frapper",
      bold: "Risque élevé",
      boldChoice: "Frapper en première intention",
      factors: ["Technique 68", "Forme 81", "Adversaire −4"],
      commit: "Valider la décision",
    },
  },
};

export type ElevenwardDetails = {
  privacy: Array<[string, string]>;
  support: Array<[string, string]>;
  deletion: Array<[string, string]>;
  press: Array<[string, string]>;
  deletionForm: {
    title: string;
    body: string;
    accountId: string;
    code: string;
    submit: string;
    success: string;
    error: string;
  };
};

export const elevenwardDetails: Record<ElevenwardLocale, ElevenwardDetails> = {
  en: {
    privacy: [
      ["Friends and weekly challenges", "Optional online features store friend relationships and challenge participation and scores. Friend comparisons require both players to enable the separate comparison-sharing setting, which starts off."],
      ["Voluntary feedback", "Guests and signed-in players can send a category and message, optional contact email or support code, and selected diagnostics after reviewing them. These submissions are used to investigate and respond to support requests."],
      ["Sharing and reviews", "Sharing a career card is voluntary. Your selected player name, fictional club, position, character artwork and career statistics can appear in the shared card. The sharing app handles it under its own policy. Studio links open a browser only when selected. Previous Apple review-prompt date and version are stored locally; Elevenward does not know whether you post a review."],
      ["Content updates", "When online, Elevenward can check a public manifest and download verified football-world content without an account. This content check does not upload a career save. Active careers keep their existing world definition."],
      ["Guest careers", "Career snapshots and the recovery journal stay on your device. A guest sends no career save to Beopity."],
      ["Optional accounts", "Optional Apple or Google sign-in uses provider account identifiers and any email supplied by the provider. Accounts can synchronize versioned career snapshots, private Hall of Fame archives, purchase entitlements, and sharing and analytics preferences."],
      ["Public leaderboards", "New signed-in accounts publish a career score and position after cloud sync unless sharing is turned off. Existing accounts start private until you enable sharing. This account setting carries across devices; turning it off removes your entries. Your career name stays private. You may claim one moderated public username or use a generated alias; other players can report a username and hide it on their device."],
      ["Purchases", "Apple or Google and RevenueCat process purchases and verification. RevenueCat uses an app purchase identifier for guests and the Elevenward account identifier when signed in. Purchase history and entitlement information support functionality and purchase analytics. Elevenward does not store payment-card details."],
      ["Analytics", "First-party product analytics and scrubbed error categories are disabled until consent. When enabled for a signed-in account, events are linked to its account identifier; they are not anonymous. Advertising and cross-app tracking are not used."],
      ["Retention and deletion", "Account deletion removes identities, sessions, saves, leaderboards, entitlement cache, and consent records. Store transaction records remain with the storefront where required."],
      ["Contact", "Privacy questions: howethstudio@gmail.com."],
    ],
    support: [
      ["Career will not load", "Do not reinstall first. Restart the device, reopen Career Slots, and include the recovery message shown by the app when contacting support."],
      ["Restore a purchase", "Open More → Shop → Restore purchases. Use the same storefront account that made the purchase. Each optional pass is a permanent purchase; current prices and availability are shown in the Shop."],
      ["Cloud conflict", "Elevenward preserves both versions. Compare their club, season, week, and revision, then explicitly choose which version continues."],
      ["Contact", "Email howethstudio@gmail.com with the app version and shortest reproduction steps. Never send a password, identity token, or purchase credential."],
    ],
    deletion: [
      ["Delete in the app", "Open More → Account & cloud → Delete account. Review the data categories and confirm. The action cannot be undone."],
      ["Delete with a code", "While signed in, request a deletion code in the app. Enter the account ID and six-digit code below before the code expires."],
      ["Local careers", "Guest careers are not on our server. Remove them from Career Slots or erase the app’s local data in device settings."],
    ],
    press: [
      ["Fact sheet", "Genre: football career and life RPG. Available on iPhone and iPad; Android is in development. Single player, complete offline regular careers, optional account features, ages 13+. The expanded 520-club world is planned for version 1.1, which is not yet available."],
      ["Launch languages", "English, Spanish, Brazilian Portuguese, and French."],
      ["Business model", "The complete regular career is free. Optional permanent passes add development and positive-income boosts, extra career slots, and cosmetics. Version 1.1 pass benefits: VIP gives 1.5× boosts; focused passes give 2× and stack with VIP to 3×. All-Access includes all three benefits."],
      ["Press contact", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirm account deletion", body: "This permanently erases the matching Elevenward cloud account.", accountId: "Account ID", code: "Six-digit code", submit: "Delete account permanently", success: "The account was deleted.", error: "The code is invalid or expired. Request a new code in the app." },
  },
  es: {
    privacy: [
      ["Amigos y desafíos semanales", "Las funciones en línea opcionales guardan relaciones de amistad, participación en desafíos y puntuaciones. Las comparaciones requieren que ambos jugadores activen la opción independiente de compartir comparaciones, desactivada al principio."],
      ["Comentarios voluntarios", "Los invitados y jugadores con cuenta pueden enviar una categoría y mensaje, correo o código de soporte opcionales y diagnósticos seleccionados tras revisarlos. Se usan para investigar y responder a solicitudes de soporte."],
      ["Compartir y reseñas", "Compartir una tarjeta de carrera es opcional. Puede mostrar el nombre elegido del jugador, club ficticio, posición, ilustración y estadísticas. La app elegida gestiona la tarjeta según su política. Los enlaces al estudio abren el navegador solo al seleccionarlos. La fecha y versión del aviso de reseña de Apple se guardan localmente; Elevenward no sabe si publicas una reseña."],
      ["Actualizaciones de contenido", "Con conexión, Elevenward puede consultar un manifiesto público y descargar contenido futbolístico verificado sin cuenta. Esta consulta no sube partidas. Las carreras activas conservan su mundo existente."],
      ["Carreras de invitado", "Las partidas y el diario de recuperación permanecen en tu dispositivo. Un invitado no envía carreras a Beopity."],
      ["Cuentas opcionales", "El acceso opcional con Apple o Google usa identificadores de cuenta y el correo que proporcione el proveedor. Puede sincronizar partidas versionadas, archivos privados del Salón de la Fama, derechos de compra y preferencias de compartir y analítica."],
      ["Clasificaciones públicas", "Las cuentas nuevas con sesión iniciada publican la puntuación y posición de una carrera tras sincronizarse, salvo si desactivas el uso compartido. Las cuentas existentes permanecen privadas hasta que lo actives. Esta opción de la cuenta se aplica en todos tus dispositivos; al desactivarla se retiran tus entradas. El nombre de tu carrera sigue siendo privado. Puedes elegir un nombre público moderado o usar un alias generado; otros jugadores pueden denunciar y ocultar un nombre en su dispositivo."],
      ["Compras", "Apple o Google y RevenueCat procesan compras y verificación. RevenueCat usa un identificador de compras para invitados y el identificador de cuenta de Elevenward al iniciar sesión. El historial y los derechos de compra sirven para el funcionamiento y la analítica de compras. Elevenward no guarda datos de tarjetas."],
      ["Analítica", "La analítica propia y las categorías de error depuradas están desactivadas hasta tu consentimiento. Al activarlas con una cuenta, los eventos se vinculan a su identificador; no son anónimos. No usamos publicidad ni rastreo entre aplicaciones."],
      ["Conservación y eliminación", "Eliminar la cuenta borra identidades, sesiones, partidas, clasificaciones, derechos almacenados y consentimientos. La tienda conserva los registros exigidos."],
      ["Contacto", "Consultas de privacidad: howethstudio@gmail.com."],
    ],
    support: [
      ["La carrera no carga", "No reinstales primero. Reinicia el dispositivo, abre Espacios de carrera e incluye el mensaje de recuperación al contactar con soporte."],
      ["Restaurar una compra", "Abre Más → Tienda → Restaurar compras con la misma cuenta de la tienda. Cada pase opcional es una compra permanente; la Tienda muestra el precio y la disponibilidad actuales."],
      ["Conflicto en la nube", "Elevenward conserva ambas versiones. Compara club, temporada, jornada y revisión y elige cuál continúa."],
      ["Contacto", "Escribe a howethstudio@gmail.com con la versión y los pasos mínimos. Nunca envíes contraseñas, tokens ni credenciales de compra."],
    ],
    deletion: [
      ["Eliminar en la app", "Abre Más → Cuenta y nube → Eliminar cuenta, revisa los datos y confirma. No se puede deshacer."],
      ["Eliminar con un código", "Con la sesión iniciada, solicita un código en la app e introduce aquí el ID de cuenta y el código de seis dígitos antes de que caduque."],
      ["Carreras locales", "Las carreras de invitado no están en el servidor. Elimínalas en Espacios de carrera o borra los datos locales del dispositivo."],
    ],
    press: [
      ["Ficha", "RPG de carrera y vida futbolística. Disponible en iPhone y iPad; Android está en desarrollo. Un jugador, carreras normales completas sin conexión, cuenta opcional, mayores de 13 años. El mundo de 520 clubes está previsto para la versión 1.1, aún no disponible."],
      ["Idiomas de lanzamiento", "Inglés, español, portugués de Brasil y francés."],
      ["Modelo de negocio", "La carrera normal completa es gratuita. Los pases permanentes opcionales añaden mejoras del desarrollo y los ingresos positivos, espacios de carrera y cosméticos. Ventajas de los pases en la versión 1.1: VIP ofrece 1,5×; los pases específicos ofrecen 2× y se combinan con VIP hasta 3×. Acceso Total incluye los tres beneficios."],
      ["Prensa", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirmar la eliminación", body: "Esto borra para siempre la cuenta de Elevenward correspondiente.", accountId: "ID de cuenta", code: "Código de seis dígitos", submit: "Eliminar la cuenta para siempre", success: "La cuenta se ha eliminado.", error: "El código no es válido o ha caducado. Solicita uno nuevo en la app." },
  },
  "pt-br": {
    privacy: [
      ["Amigos e desafios semanais", "Recursos online opcionais guardam relações de amizade, participação em desafios e pontuações. Comparações exigem que os dois jogadores ativem a opção independente de compartilhar comparações, desativada inicialmente."],
      ["Feedback voluntário", "Convidados e jogadores com conta podem enviar categoria e mensagem, e-mail ou código de suporte opcionais e diagnósticos selecionados após revisá-los. São usados para investigar e responder a pedidos de suporte."],
      ["Compartilhamento e avaliações", "Compartilhar um cartão de carreira é opcional. Ele pode mostrar nome escolhido do jogador, clube fictício, posição, arte e estatísticas. O app escolhido trata o cartão segundo sua política. Links do estúdio abrem o navegador apenas quando selecionados. Data e versão do aviso de avaliação da Apple ficam salvas localmente; Elevenward não sabe se você publica uma avaliação."],
      ["Atualizações de conteúdo", "Online, Elevenward pode consultar um manifesto público e baixar conteúdo de futebol verificado sem conta. Essa consulta não envia saves. Carreiras ativas preservam o mundo existente."],
      ["Carreiras de convidado", "Os saves e o diário de recuperação ficam no aparelho. Um convidado não envia a carreira à Beopity."],
      ["Contas opcionais", "O acesso opcional com Apple ou Google usa identificadores da conta e o e-mail fornecido pelo provedor. Pode sincronizar saves versionados, arquivos privados do Hall da Fama, direitos de compra e preferências de compartilhamento e análise."],
      ["Rankings públicos", "Novas contas conectadas publicam a pontuação e a posição da carreira após a sincronização, a menos que o compartilhamento seja desativado. Contas existentes permanecem privadas até que você o ative. Essa opção da conta vale em todos os seus aparelhos; ao desativá-la, suas entradas são removidas. O nome da carreira permanece privado. Você pode escolher um nome público moderado ou usar um apelido gerado; outros jogadores podem denunciar e ocultar um nome no aparelho."],
      ["Compras", "Apple ou Google e RevenueCat processam compras e verificação. RevenueCat usa um identificador de compras para convidados e o identificador da conta Elevenward após o acesso. Histórico e direitos de compra servem ao funcionamento e à análise de compras. Elevenward não guarda dados de cartão."],
      ["Análises", "Análises próprias e categorias de erro filtradas ficam desativadas até o consentimento. Quando ativadas em uma conta, os eventos ficam vinculados ao identificador dela; não são anônimos. Não há publicidade nem rastreamento entre apps."],
      ["Retenção e exclusão", "Excluir a conta remove identidades, sessões, saves, rankings, direitos em cache e consentimentos. A loja mantém registros quando exigido."],
      ["Contato", "Dúvidas sobre privacidade: howethstudio@gmail.com."],
    ],
    support: [
      ["A carreira não abre", "Não reinstale primeiro. Reinicie o aparelho, abra Espaços de carreira e informe a mensagem de recuperação ao suporte."],
      ["Restaurar uma compra", "Abra Mais → Loja → Restaurar compras com a mesma conta da loja. Cada passe opcional é uma compra permanente; a Loja mostra o preço e a disponibilidade atuais."],
      ["Conflito na nuvem", "Elevenward preserva as duas versões. Compare clube, temporada, rodada e revisão e escolha qual deve continuar."],
      ["Contato", "Envie e-mail para howethstudio@gmail.com com a versão e os passos mínimos. Nunca envie senha, token ou credencial de compra."],
    ],
    deletion: [
      ["Excluir no app", "Abra Mais → Conta e nuvem → Excluir conta, confira os dados e confirme. A ação não pode ser desfeita."],
      ["Excluir com um código", "Com a conta conectada, solicite um código no app e informe abaixo o ID da conta e o código de seis dígitos antes do vencimento."],
      ["Carreiras locais", "Carreiras de convidado não ficam no servidor. Apague-as em Espaços de carreira ou remova os dados locais nas configurações do aparelho."],
    ],
    press: [
      ["Ficha técnica", "RPG de carreira e vida no futebol. Disponível no iPhone e iPad; Android está em desenvolvimento. Um jogador, carreiras normais completas offline, conta opcional, público 13+. O mundo de 520 clubes está previsto para a versão 1.1, ainda não disponível."],
      ["Idiomas de lançamento", "Inglês, espanhol, português do Brasil e francês."],
      ["Modelo de negócio", "A carreira normal completa é gratuita. Passes permanentes opcionais oferecem bônus de desenvolvimento e renda positiva, espaços de carreira e cosméticos. Benefícios dos passes na versão 1.1: VIP oferece 1,5×; passes específicos oferecem 2× e combinam com VIP até 3×. Acesso Total inclui os três benefícios."],
      ["Imprensa", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirmar exclusão da conta", body: "Isso apaga permanentemente a conta Elevenward correspondente.", accountId: "ID da conta", code: "Código de seis dígitos", submit: "Excluir a conta permanentemente", success: "A conta foi excluída.", error: "O código é inválido ou expirou. Solicite um novo código no app." },
  },
  fr: {
    privacy: [
      ["Amis et défis hebdomadaires", "Les fonctions en ligne facultatives conservent relations d’amitié, participation aux défis et scores. Les comparaisons exigent que les deux joueurs activent le réglage indépendant de partage des comparaisons, désactivé au départ."],
      ["Commentaires volontaires", "Invités et joueurs connectés peuvent envoyer catégorie et message, e-mail ou code d’assistance facultatifs et diagnostics sélectionnés après les avoir vérifiés. Ils servent à examiner les demandes d’assistance et à y répondre."],
      ["Partage et avis", "Partager une carte de carrière est facultatif. Elle peut afficher nom choisi du joueur, club fictif, poste, visuel et statistiques. L’application choisie traite la carte selon sa politique. Les liens du studio ouvrent un navigateur uniquement après sélection. Date et version de l’invite d’avis Apple sont conservées localement ; Elevenward ne sait pas si vous publiez un avis."],
      ["Mises à jour du contenu", "En ligne, Elevenward peut consulter un manifeste public et télécharger du contenu de football vérifié sans compte. Cette consultation n’envoie pas de sauvegarde. Les carrières actives conservent leur monde existant."],
      ["Carrières invitées", "Les sauvegardes et le journal de récupération restent sur l’appareil. Un invité n’envoie aucune carrière à Beopity."],
      ["Comptes facultatifs", "La connexion facultative Apple ou Google utilise les identifiants de compte et l’e-mail fourni par le prestataire. Elle peut synchroniser sauvegardes versionnées, archives privées du Panthéon, droits d’achat et préférences de partage et d’analyse."],
      ["Classements publics", "Les nouveaux comptes connectés publient le score et le poste d’une carrière après synchronisation, sauf si le partage est désactivé. Les comptes existants restent privés jusqu’à ce que vous l’activiez. Ce réglage du compte s’applique sur tous vos appareils ; le désactiver retire vos entrées. Le nom de votre carrière reste privé. Vous pouvez choisir un pseudonyme public modéré ou utiliser un alias généré ; les autres joueurs peuvent signaler et masquer un nom sur leur appareil."],
      ["Achats", "Apple ou Google et RevenueCat traitent achats et vérification. RevenueCat utilise un identifiant d’achat pour les invités et l’identifiant du compte Elevenward après connexion. Historique et droits d’achat servent au fonctionnement et à l’analyse des achats. Elevenward ne conserve pas les données de carte."],
      ["Analyse", "L’analyse interne et les catégories d’erreur filtrées restent désactivées sans consentement. Une fois activés pour un compte, les événements sont liés à son identifiant ; ils ne sont pas anonymes. Aucune publicité ni suivi entre applications."],
      ["Conservation et suppression", "La suppression efface identités, sessions, sauvegardes, classements, droits en cache et consentements. La boutique conserve les traces exigées."],
      ["Contact", "Questions de confidentialité : howethstudio@gmail.com."],
    ],
    support: [
      ["La carrière ne s’ouvre pas", "Ne réinstallez pas d’abord. Redémarrez l’appareil, ouvrez Emplacements de carrière et joignez le message de récupération au support."],
      ["Restaurer un achat", "Ouvrez Plus → Boutique → Restaurer les achats avec le même compte de boutique. Chaque pass facultatif est un achat permanent ; la Boutique affiche prix et disponibilité actuels."],
      ["Conflit cloud", "Elevenward conserve les deux versions. Comparez club, saison, semaine et révision, puis choisissez celle qui continue."],
      ["Contact", "Écrivez à howethstudio@gmail.com avec la version et les étapes minimales. N’envoyez jamais de mot de passe, jeton ou identifiant d’achat."],
    ],
    deletion: [
      ["Supprimer dans l’app", "Ouvrez Plus → Compte et cloud → Supprimer le compte, vérifiez les données et confirmez. Cette action est irréversible."],
      ["Supprimer avec un code", "Une fois connecté, demandez un code dans l’app puis saisissez ci-dessous l’identifiant du compte et le code à six chiffres avant son expiration."],
      ["Carrières locales", "Les carrières invitées ne sont pas sur le serveur. Supprimez-les dans Emplacements de carrière ou effacez les données locales de l’appareil."],
    ],
    press: [
      ["Fiche", "RPG de carrière et de vie dans le football. Disponible sur iPhone et iPad ; Android est en développement. Solo, carrières normales complètes hors ligne, compte facultatif, public 13+. Le monde de 520 clubs est prévu pour la version 1.1, encore indisponible."],
      ["Langues de lancement", "Anglais, espagnol, portugais du Brésil et français."],
      ["Modèle économique", "La carrière normale complète est gratuite. Les pass permanents facultatifs ajoutent des bonus de progression et de revenus positifs, des emplacements de carrière et des cosmétiques. Avantages des pass dans la version 1.1 : VIP offre 1,5× ; les pass ciblés offrent 2× et se combinent avec VIP jusqu’à 3×. Accès Total inclut les trois avantages."],
      ["Presse", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirmer la suppression", body: "Cette action efface définitivement le compte Elevenward correspondant.", accountId: "Identifiant du compte", code: "Code à six chiffres", submit: "Supprimer définitivement", success: "Le compte a été supprimé.", error: "Le code est incorrect ou expiré. Demandez-en un nouveau dans l’app." },
  },
};
