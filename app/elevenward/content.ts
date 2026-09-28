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
    secondaryAction: "Get launch updates",
    pillars: [
      ["Your football", "Four positions, twelve archetypes, and eight visible attributes. Every outcome shows its reasons."],
      ["Your world", "Six original football countries, promotion, cups, international nights, and national-team call-ups."],
      ["Your life", "Contracts, agents, teammates, family, sponsors, wellness, style, homes, and community choices."],
      ["Your legacy", "Play offline from age 17 to retirement and leave behind a career verdict built from the whole story."],
    ],
    loopTitle: "One week. One chain of consequences.",
    loop: ["Choose a focus", "Read selection and matchup", "Own a spotlight decision", "Understand the result", "Handle life away from football", "Advance the world"],
    worldTitle: "A world made for Elevenward.",
    worldBody: "120 fictional clubs, 24 national teams, domestic cups, promotion and relegation, and an international club competition—without real players, protected crests, or borrowed identities.",
    promiseTitle: "The full career is free.",
    promiseBody: "No ads, subscriptions, energy timers, premium currency, loot boxes, or paid progression. Optional permanent upgrades add save slots and presentation cosmetics only.",
    supportTitle: "Elevenward support",
    supportBody: "For installation, careers, purchases, cloud saves, accessibility, or account help, email howethstudio@gmail.com with your app version, device, and the shortest steps that reproduce the issue.",
    privacyTitle: "Privacy by design",
    privacyBody: "Guest careers stay entirely on the device. Optional accounts synchronize durable career data only. Elevenward does not request contacts, precise location, camera, microphone, advertising identifiers, or cross-app tracking data.",
    deletionTitle: "Delete your Elevenward account",
    deletionBody: "Use Settings → Account → Delete account in the app. This permanently removes the account, identities, sessions, cloud careers, leaderboard entries, and consent records. Local guest careers can be deleted from Career Slots.",
    pressTitle: "Elevenward press kit",
    pressBody: "Elevenward is an original portrait-first football career and life RPG from Howeth Studio, built for complete offline careers with optional cloud features and fair permanent cosmetic upgrades.",
  },
  es: {
    language: "Español",
    title: "Cada semana hace avanzar una vida.",
    subtitle: "RPG de carrera y vida futbolística",
    intro: "Empieza con 17 años. Gánate un puesto, lee el partido, decide en los momentos clave y vive todo lo que el fútbol cambia fuera del campo.",
    primaryAction: "Ver la carrera",
    secondaryAction: "Recibir novedades",
    pillars: [
      ["Tu fútbol", "Cuatro posiciones, doce arquetipos y ocho atributos visibles. Cada resultado explica sus razones."],
      ["Tu mundo", "Seis países originales, ascensos, copas, noches internacionales y convocatorias nacionales."],
      ["Tu vida", "Contratos, agentes, compañeros, familia, patrocinadores, bienestar, estilo, hogares y comunidad."],
      ["Tu legado", "Juega sin conexión desde los 17 años hasta la retirada y deja un veredicto sobre toda tu historia."],
    ],
    loopTitle: "Una semana. Una cadena de consecuencias.",
    loop: ["Elige un enfoque", "Revisa selección y rival", "Decide en un momento clave", "Comprende el resultado", "Gestiona la vida fuera del campo", "Haz avanzar el mundo"],
    worldTitle: "Un mundo creado para Elevenward.",
    worldBody: "120 clubes ficticios, 24 selecciones, copas nacionales, ascensos, descensos y competición internacional, sin jugadores reales ni identidades prestadas.",
    promiseTitle: "La carrera completa es gratuita.",
    promiseBody: "Sin anuncios, suscripciones, energía, moneda prémium, cajas de botín ni progreso de pago. Las mejoras permanentes solo añaden espacios y cosméticos.",
    supportTitle: "Soporte de Elevenward",
    supportBody: "Para ayuda con instalación, carreras, compras, nube, accesibilidad o cuenta, escribe a howethstudio@gmail.com con la versión, el dispositivo y los pasos del problema.",
    privacyTitle: "Privacidad desde el diseño",
    privacyBody: "Las carreras de invitado permanecen en el dispositivo. Las cuentas opcionales solo sincronizan datos duraderos de carrera. No solicitamos contactos, ubicación precisa, cámara, micrófono ni identificadores publicitarios.",
    deletionTitle: "Eliminar tu cuenta de Elevenward",
    deletionBody: "Usa Ajustes → Cuenta → Eliminar cuenta en la app. Se eliminarán la cuenta, identidades, sesiones, carreras en la nube, clasificaciones y consentimientos. Las carreras locales se borran en Espacios de carrera.",
    pressTitle: "Kit de prensa de Elevenward",
    pressBody: "Elevenward es un RPG original de carrera y vida futbolística de Howeth Studio, diseñado para jugar sin conexión con funciones opcionales en la nube.",
  },
  "pt-br": {
    language: "Português do Brasil",
    title: "Cada semana faz uma vida avançar.",
    subtitle: "RPG de carreira e vida no futebol",
    intro: "Comece aos 17. Conquiste seu lugar, leia a partida, decida nos grandes momentos e viva tudo que o futebol muda fora de campo.",
    primaryAction: "Ver a carreira",
    secondaryAction: "Receber novidades",
    pillars: [
      ["Seu futebol", "Quatro posições, doze arquétipos e oito atributos visíveis. Todo resultado mostra seus motivos."],
      ["Seu mundo", "Seis países originais, acesso, copas, noites internacionais e convocações para a seleção."],
      ["Sua vida", "Contratos, agentes, colegas, família, patrocinadores, bem-estar, estilo, casas e comunidade."],
      ["Seu legado", "Jogue offline dos 17 anos até a aposentadoria e deixe um veredito construído por toda a história."],
    ],
    loopTitle: "Uma semana. Uma cadeia de consequências.",
    loop: ["Escolha um foco", "Veja escalação e adversário", "Decida um momento-chave", "Entenda o resultado", "Cuide da vida fora de campo", "Faça o mundo avançar"],
    worldTitle: "Um mundo criado para Elevenward.",
    worldBody: "120 clubes fictícios, 24 seleções, copas nacionais, acesso, rebaixamento e competição internacional, sem jogadores reais ou identidades emprestadas.",
    promiseTitle: "A carreira completa é gratuita.",
    promiseBody: "Sem anúncios, assinaturas, energia, moeda premium, caixas de itens ou progresso pago. Melhorias permanentes só adicionam espaços e cosméticos.",
    supportTitle: "Suporte do Elevenward",
    supportBody: "Para ajuda com instalação, carreiras, compras, nuvem, acessibilidade ou conta, envie um e-mail para howethstudio@gmail.com com versão, aparelho e passos do problema.",
    privacyTitle: "Privacidade desde o início",
    privacyBody: "Carreiras de convidado ficam no aparelho. Contas opcionais sincronizam apenas dados duráveis da carreira. Não solicitamos contatos, localização precisa, câmera, microfone ou identificadores de publicidade.",
    deletionTitle: "Excluir sua conta Elevenward",
    deletionBody: "Use Ajustes → Conta → Excluir conta no app. Conta, identidades, sessões, carreiras na nuvem, rankings e consentimentos serão removidos. Carreiras locais podem ser apagadas em Espaços de carreira.",
    pressTitle: "Kit de imprensa do Elevenward",
    pressBody: "Elevenward é um RPG original de carreira e vida no futebol da Howeth Studio, feito para carreiras offline completas com recursos opcionais na nuvem.",
  },
  fr: {
    language: "Français",
    title: "Chaque semaine fait avancer une vie.",
    subtitle: "RPG de carrière et de vie dans le football",
    intro: "Commencez à 17 ans. Gagnez votre place, lisez le match, décidez dans les moments clés et vivez tout ce que le football change hors du terrain.",
    primaryAction: "Voir la carrière",
    secondaryAction: "Recevoir les actualités",
    pillars: [
      ["Votre football", "Quatre postes, douze archétypes et huit attributs visibles. Chaque résultat explique ses raisons."],
      ["Votre monde", "Six pays originaux, montées, coupes, soirées internationales et sélections nationales."],
      ["Votre vie", "Contrats, agents, coéquipiers, famille, sponsors, bien-être, style, logement et communauté."],
      ["Votre héritage", "Jouez hors ligne de 17 ans à la retraite et laissez un verdict construit sur toute votre histoire."],
    ],
    loopTitle: "Une semaine. Une chaîne de conséquences.",
    loop: ["Choisir un objectif", "Lire la sélection et l’adversaire", "Décider dans un moment clé", "Comprendre le résultat", "Gérer la vie hors terrain", "Faire avancer le monde"],
    worldTitle: "Un monde créé pour Elevenward.",
    worldBody: "120 clubs fictifs, 24 équipes nationales, coupes, montées, descentes et compétition internationale, sans vrais joueurs ni identités empruntées.",
    promiseTitle: "La carrière complète est gratuite.",
    promiseBody: "Sans publicité, abonnement, énergie, monnaie premium, loot box ni progression payante. Les achats permanents ajoutent seulement des emplacements et des cosmétiques.",
    supportTitle: "Assistance Elevenward",
    supportBody: "Pour toute aide concernant l’installation, les carrières, achats, sauvegardes, l’accessibilité ou le compte, écrivez à howethstudio@gmail.com avec la version, l’appareil et les étapes du problème.",
    privacyTitle: "La confidentialité dès la conception",
    privacyBody: "Les carrières invitées restent sur l’appareil. Les comptes facultatifs synchronisent uniquement les données durables. Aucun accès aux contacts, à la localisation précise, à la caméra, au micro ou aux identifiants publicitaires.",
    deletionTitle: "Supprimer votre compte Elevenward",
    deletionBody: "Utilisez Réglages → Compte → Supprimer le compte dans l’app. Le compte, les identités, sessions, carrières cloud, classements et consentements seront supprimés. Les carrières locales se suppriment dans Emplacements de carrière.",
    pressTitle: "Kit presse Elevenward",
    pressBody: "Elevenward est un RPG original de carrière et de vie dans le football signé Howeth Studio, conçu pour des carrières complètes hors ligne avec des fonctions cloud facultatives.",
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
    backToStudio: "Howeth Studio home",
    overview: "Overview",
    career: "Career",
    world: "World",
    fairPlay: "Fair play",
    support: "Support",
    privacy: "Privacy",
    press: "Press",
    deleteAccount: "Delete account",
    developmentStatus: "In development",
    platforms: "Coming to iOS and Android",
    scrollPrompt: "Explore the career",
    careerEyebrow: "Your career, clearly told",
    careerTitle: "The whole football life, without the mystery.",
    loopEyebrow: "The weekly rhythm",
    worldEyebrow: "A living football world",
    promiseEyebrow: "Fair by design",
    privacyAction: "Read the privacy promise",
    studioLine: "An original game by Howeth Studio",
    stats: [["4", "positions"], ["12", "archetypes"], ["20", "seasons maximum"], ["100%", "offline career"]],
    fairPoints: ["No ads", "No subscriptions", "No energy timers", "No pay-to-win"],
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
    backToStudio: "Inicio de Howeth Studio",
    overview: "Resumen",
    career: "Carrera",
    world: "Mundo",
    fairPlay: "Juego limpio",
    support: "Soporte",
    privacy: "Privacidad",
    press: "Prensa",
    deleteAccount: "Eliminar cuenta",
    developmentStatus: "En desarrollo",
    platforms: "Próximamente en iOS y Android",
    scrollPrompt: "Explorar la carrera",
    careerEyebrow: "Tu carrera, contada con claridad",
    careerTitle: "Toda la vida del fútbol, sin misterios.",
    loopEyebrow: "El ritmo semanal",
    worldEyebrow: "Un mundo futbolístico vivo",
    promiseEyebrow: "Justo por diseño",
    privacyAction: "Leer la promesa de privacidad",
    studioLine: "Un juego original de Howeth Studio",
    stats: [["4", "posiciones"], ["12", "arquetipos"], ["20", "temporadas máximo"], ["100%", "carrera sin conexión"]],
    fairPoints: ["Sin anuncios", "Sin suscripciones", "Sin límites de energía", "Sin pagar para ganar"],
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
    backToStudio: "Início da Howeth Studio",
    overview: "Visão geral",
    career: "Carreira",
    world: "Mundo",
    fairPlay: "Jogo justo",
    support: "Suporte",
    privacy: "Privacidade",
    press: "Imprensa",
    deleteAccount: "Excluir conta",
    developmentStatus: "Em desenvolvimento",
    platforms: "Em breve para iOS e Android",
    scrollPrompt: "Explorar a carreira",
    careerEyebrow: "Sua carreira, contada com clareza",
    careerTitle: "Toda a vida no futebol, sem mistério.",
    loopEyebrow: "O ritmo semanal",
    worldEyebrow: "Um mundo vivo do futebol",
    promiseEyebrow: "Justo desde o início",
    privacyAction: "Ler o compromisso de privacidade",
    studioLine: "Um jogo original da Howeth Studio",
    stats: [["4", "posições"], ["12", "arquétipos"], ["20", "temporadas no máximo"], ["100%", "carreira offline"]],
    fairPoints: ["Sem anúncios", "Sem assinaturas", "Sem limite de energia", "Sem pagar para vencer"],
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
    backToStudio: "Accueil Howeth Studio",
    overview: "Aperçu",
    career: "Carrière",
    world: "Monde",
    fairPlay: "Jeu équitable",
    support: "Assistance",
    privacy: "Confidentialité",
    press: "Presse",
    deleteAccount: "Supprimer le compte",
    developmentStatus: "En développement",
    platforms: "Bientôt sur iOS et Android",
    scrollPrompt: "Explorer la carrière",
    careerEyebrow: "Votre carrière, racontée clairement",
    careerTitle: "Toute une vie de football, sans mystère.",
    loopEyebrow: "Le rythme hebdomadaire",
    worldEyebrow: "Un monde du football vivant",
    promiseEyebrow: "Équitable par conception",
    privacyAction: "Lire la promesse de confidentialité",
    studioLine: "Un jeu original de Howeth Studio",
    stats: [["4", "postes"], ["12", "archétypes"], ["20", "saisons maximum"], ["100%", "carrière hors ligne"]],
    fairPoints: ["Sans publicité", "Sans abonnement", "Sans limite d’énergie", "Sans payer pour gagner"],
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
      ["Guest careers", "Career snapshots and the recovery journal stay on your device. A guest sends no career save to Howeth Studio."],
      ["Optional accounts", "Apple or Google sign-in can synchronize versioned career snapshots, generated leaderboard aliases, entitlements, and analytics consent."],
      ["Public leaderboards", "Signed-in careers publish a score and position after cloud sync, unless you previously opted out. Your career name stays private. You may claim one moderated public username or use a generated alias; other players can report a username and hide it on their device."],
      ["Purchases", "Apple, Google, and RevenueCat process purchases. Elevenward stores entitlement state, not payment-card details."],
      ["Analytics", "First-party product analytics and scrubbed error categories are disabled until consent. Advertising and cross-app tracking are not used."],
      ["Retention and deletion", "Account deletion removes identities, sessions, saves, leaderboards, entitlement cache, and consent records. Store transaction records remain with the storefront where required."],
      ["Contact", "Privacy questions: howethstudio@gmail.com."],
    ],
    support: [
      ["Career will not load", "Do not reinstall first. Restart the device, reopen Career Slots, and include the recovery message shown by the app when contacting support."],
      ["Restore a purchase", "Open More → Permanent upgrades → Restore purchases. Use the same Apple or Google storefront account that made the purchase."],
      ["Cloud conflict", "Elevenward preserves both versions. Compare their club, season, week, and revision, then explicitly choose which version continues."],
      ["Contact", "Email howethstudio@gmail.com with the app version and shortest reproduction steps. Never send a password, identity token, or purchase credential."],
    ],
    deletion: [
      ["Delete in the app", "Open More → Account & cloud → Delete account. Review the data categories and confirm. The action cannot be undone."],
      ["Delete with a code", "While signed in, request a deletion code in the app. Enter the account ID and six-digit code below before the code expires."],
      ["Local careers", "Guest careers are not on our server. Remove them from Career Slots or erase the app’s local data in device settings."],
    ],
    press: [
      ["Fact sheet", "Genre: football career and life RPG. Platforms: iOS and Android. Single player, complete offline careers, optional account features, ages 13+."],
      ["Launch languages", "English, Spanish, Brazilian Portuguese, and French."],
      ["Business model", "The complete career is free. Optional one-time purchases add career slots and presentation cosmetics only."],
      ["Press contact", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirm account deletion", body: "This permanently erases the matching Elevenward cloud account.", accountId: "Account ID", code: "Six-digit code", submit: "Delete account permanently", success: "The account was deleted.", error: "The code is invalid or expired. Request a new code in the app." },
  },
  es: {
    privacy: [
      ["Carreras de invitado", "Las partidas y el diario de recuperación permanecen en tu dispositivo. Un invitado no envía carreras a Howeth Studio."],
      ["Cuentas opcionales", "El acceso con Apple o Google puede sincronizar partidas versionadas, alias generados, derechos de compra y consentimiento analítico."],
      ["Clasificaciones públicas", "Las carreras con sesión iniciada publican una puntuación y posición tras sincronizarse, salvo si rechazaste compartirlas antes. El nombre de tu carrera sigue siendo privado. Puedes elegir un nombre público moderado o usar un alias generado; otros jugadores pueden denunciar y ocultar un nombre en su dispositivo."],
      ["Compras", "Apple, Google y RevenueCat procesan las compras. Elevenward guarda el derecho de uso, no datos de tarjetas."],
      ["Analítica", "La analítica propia y las categorías de error anónimas están desactivadas hasta que des tu consentimiento. No usamos publicidad ni rastreo entre aplicaciones."],
      ["Conservación y eliminación", "Eliminar la cuenta borra identidades, sesiones, partidas, clasificaciones, derechos almacenados y consentimientos. La tienda conserva los registros exigidos."],
      ["Contacto", "Consultas de privacidad: howethstudio@gmail.com."],
    ],
    support: [
      ["La carrera no carga", "No reinstales primero. Reinicia el dispositivo, abre Espacios de carrera e incluye el mensaje de recuperación al contactar con soporte."],
      ["Restaurar una compra", "Abre Más → Mejoras permanentes → Restaurar compras con la misma cuenta de Apple o Google."],
      ["Conflicto en la nube", "Elevenward conserva ambas versiones. Compara club, temporada, jornada y revisión y elige cuál continúa."],
      ["Contacto", "Escribe a howethstudio@gmail.com con la versión y los pasos mínimos. Nunca envíes contraseñas, tokens ni credenciales de compra."],
    ],
    deletion: [
      ["Eliminar en la app", "Abre Más → Cuenta y nube → Eliminar cuenta, revisa los datos y confirma. No se puede deshacer."],
      ["Eliminar con un código", "Con la sesión iniciada, solicita un código en la app e introduce aquí el ID de cuenta y el código de seis dígitos antes de que caduque."],
      ["Carreras locales", "Las carreras de invitado no están en el servidor. Elimínalas en Espacios de carrera o borra los datos locales del dispositivo."],
    ],
    press: [
      ["Ficha", "Género: RPG de carrera y vida futbolística. iOS y Android. Un jugador, carreras offline completas, cuenta opcional, mayores de 13 años."],
      ["Idiomas de lanzamiento", "Inglés, español, portugués de Brasil y francés."],
      ["Modelo de negocio", "La carrera completa es gratuita. Las compras únicas solo añaden espacios y cosméticos de presentación."],
      ["Prensa", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirmar la eliminación", body: "Esto borra para siempre la cuenta de Elevenward correspondiente.", accountId: "ID de cuenta", code: "Código de seis dígitos", submit: "Eliminar la cuenta para siempre", success: "La cuenta se ha eliminado.", error: "El código no es válido o ha caducado. Solicita uno nuevo en la app." },
  },
  "pt-br": {
    privacy: [
      ["Carreiras de convidado", "Os saves e o diário de recuperação ficam no aparelho. Um convidado não envia a carreira à Howeth Studio."],
      ["Contas opcionais", "Entrar com Apple ou Google pode sincronizar saves versionados, apelidos gerados, direitos de compra e consentimento de análise."],
      ["Rankings públicos", "Carreiras conectadas publicam pontuação e posição após a sincronização, exceto se você já recusou o compartilhamento. O nome da carreira permanece privado. Você pode escolher um nome público moderado ou usar um apelido gerado; outros jogadores podem denunciar e ocultar um nome no aparelho."],
      ["Compras", "Apple, Google e RevenueCat processam as compras. Elevenward guarda o direito de acesso, não dados de cartão."],
      ["Análises", "Análises próprias e categorias de erro sem dados pessoais ficam desativadas até o consentimento. Não há publicidade nem rastreamento entre apps."],
      ["Retenção e exclusão", "Excluir a conta remove identidades, sessões, saves, rankings, direitos em cache e consentimentos. A loja mantém registros quando exigido."],
      ["Contato", "Dúvidas sobre privacidade: howethstudio@gmail.com."],
    ],
    support: [
      ["A carreira não abre", "Não reinstale primeiro. Reinicie o aparelho, abra Espaços de carreira e informe a mensagem de recuperação ao suporte."],
      ["Restaurar uma compra", "Abra Mais → Melhorias permanentes → Restaurar compras usando a mesma conta Apple ou Google."],
      ["Conflito na nuvem", "Elevenward preserva as duas versões. Compare clube, temporada, rodada e revisão e escolha qual deve continuar."],
      ["Contato", "Envie e-mail para howethstudio@gmail.com com a versão e os passos mínimos. Nunca envie senha, token ou credencial de compra."],
    ],
    deletion: [
      ["Excluir no app", "Abra Mais → Conta e nuvem → Excluir conta, confira os dados e confirme. A ação não pode ser desfeita."],
      ["Excluir com um código", "Com a conta conectada, solicite um código no app e informe abaixo o ID da conta e o código de seis dígitos antes do vencimento."],
      ["Carreiras locais", "Carreiras de convidado não ficam no servidor. Apague-as em Espaços de carreira ou remova os dados locais nas configurações do aparelho."],
    ],
    press: [
      ["Ficha técnica", "Gênero: RPG de carreira e vida no futebol. iOS e Android. Um jogador, carreiras offline completas, conta opcional, público 13+."],
      ["Idiomas de lançamento", "Inglês, espanhol, português do Brasil e francês."],
      ["Modelo de negócio", "A carreira completa é gratuita. Compras únicas só adicionam espaços e cosméticos de apresentação."],
      ["Imprensa", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirmar exclusão da conta", body: "Isso apaga permanentemente a conta Elevenward correspondente.", accountId: "ID da conta", code: "Código de seis dígitos", submit: "Excluir a conta permanentemente", success: "A conta foi excluída.", error: "O código é inválido ou expirou. Solicite um novo código no app." },
  },
  fr: {
    privacy: [
      ["Carrières invitées", "Les sauvegardes et le journal de récupération restent sur l’appareil. Un invité n’envoie aucune carrière à Howeth Studio."],
      ["Comptes facultatifs", "La connexion Apple ou Google peut synchroniser des sauvegardes versionnées, alias générés, droits d’achat et consentement analytique."],
      ["Classements publics", "Les carrières connectées publient un score et un poste après synchronisation, sauf si vous avez déjà refusé le partage. Le nom de votre carrière reste privé. Vous pouvez choisir un pseudonyme public modéré ou utiliser un alias généré ; les autres joueurs peuvent signaler et masquer un nom sur leur appareil."],
      ["Achats", "Apple, Google et RevenueCat traitent les achats. Elevenward conserve le droit d’accès, jamais les données de carte."],
      ["Analyse", "L’analyse interne et les catégories d’erreur anonymisées restent désactivées sans consentement. Aucune publicité ni suivi entre applications."],
      ["Conservation et suppression", "La suppression efface identités, sessions, sauvegardes, classements, droits en cache et consentements. La boutique conserve les traces exigées."],
      ["Contact", "Questions de confidentialité : howethstudio@gmail.com."],
    ],
    support: [
      ["La carrière ne s’ouvre pas", "Ne réinstallez pas d’abord. Redémarrez l’appareil, ouvrez Emplacements de carrière et joignez le message de récupération au support."],
      ["Restaurer un achat", "Ouvrez Plus → Améliorations permanentes → Restaurer les achats avec le même compte Apple ou Google."],
      ["Conflit cloud", "Elevenward conserve les deux versions. Comparez club, saison, semaine et révision, puis choisissez celle qui continue."],
      ["Contact", "Écrivez à howethstudio@gmail.com avec la version et les étapes minimales. N’envoyez jamais de mot de passe, jeton ou identifiant d’achat."],
    ],
    deletion: [
      ["Supprimer dans l’app", "Ouvrez Plus → Compte et cloud → Supprimer le compte, vérifiez les données et confirmez. Cette action est irréversible."],
      ["Supprimer avec un code", "Une fois connecté, demandez un code dans l’app puis saisissez ci-dessous l’identifiant du compte et le code à six chiffres avant son expiration."],
      ["Carrières locales", "Les carrières invitées ne sont pas sur le serveur. Supprimez-les dans Emplacements de carrière ou effacez les données locales de l’appareil."],
    ],
    press: [
      ["Fiche", "Genre : RPG de carrière et de vie dans le football. iOS et Android. Solo, carrières hors ligne complètes, compte facultatif, public 13+."],
      ["Langues de lancement", "Anglais, espagnol, portugais du Brésil et français."],
      ["Modèle économique", "La carrière complète est gratuite. Les achats uniques ajoutent seulement des emplacements et des cosmétiques de présentation."],
      ["Presse", "howethstudio@gmail.com"],
    ],
    deletionForm: { title: "Confirmer la suppression", body: "Cette action efface définitivement le compte Elevenward correspondant.", accountId: "Identifiant du compte", code: "Code à six chiffres", submit: "Supprimer définitivement", success: "Le compte a été supprimé.", error: "Le code est incorrect ou expiré. Demandez-en un nouveau dans l’app." },
  },
};
