from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
from deep_translator import GoogleTranslator
import json
import re
import time

ROOT = Path.cwd()
SOURCE = ROOT / "it.html"
CACHE_FILE = ROOT / ".translation-review-cache.json"

if not SOURCE.exists():
    raise SystemExit("ERRORE: it.html non trovato")

source_html = SOURCE.read_text(encoding="utf-8-sig")

LANGUAGES = {
    "en": {
        "file": "index.html",
        "dir": "ltr",
        "glossary": {
            "residenze sanitarie assistenziali per anziani": "residential care homes and assisted-living facilities",
            "RSA": "residential care facilities",
            "appartamenti protetti": "assisted-living apartments",
            "assistenza alla fragilità": "support for vulnerable people",
            "lettura operativa": "operational insight",
            "supporto osservativo": "observational support",
            "baseline individuale": "individual baseline",
            "derive": "deviations from the individual baseline",
            "persone seguite": "people supported",
            "persona seguita": "person supported",
            "badanti": "home-care workers",
            "figure autorizzate": "authorised professionals",
            "al lordo di": "before deducting",
            "valorizzazione interna prudente": "conservative internal valuation",
            "banca dati": "longitudinal dataset",
        },
        "manual": {
            "Dai segnali": "From signals",
            "alla lettura operativa.": "to operational insight.",
            "Perché nasce": "Why it exists",
            "Origine": "Origins",
            "Mercato": "Market",
            "Trial": "Trial",
            "Economia": "Business model",
            "Sistema": "System",
            "Confronto": "Comparison",
            "Stato": "Current status",
            "Contatto": "Contact",
            "Area privata": "Private area",
            "Scrivi ora": "Contact us",
            "Nome e cognome": "Full name",
            "Tipo contatto": "Contact type",
            "Azienda / ente": "Company / organisation",
            "Email per ricontatto": "Contact email",
            "Telefono per ricontatto": "Contact telephone",
            "Preferenza": "Preferred contact method",
            "Risposta via email": "Reply by email",
            "Richiamatemi telefonicamente": "Call me back",
            "Messaggio": "Message",
            "Allegati": "Attachments",
            "Privato": "Individual",
            "Non diagnostico": "Non-diagnostic",
            "Attivo": "Active",
            "In sviluppo": "In development",
            "Su misura": "Tailored",
            "Come funziona": "How it works",
            "Stato attuale": "Current status",
            "Visione": "Vision",
        },
    },
    "es": {
        "file": "es.html",
        "dir": "ltr",
        "glossary": {
            "residenze sanitarie assistenziali per anziani": "residencias asistenciales para personas mayores",
            "RSA": "residencias asistenciales para personas mayores",
            "appartamenti protetti": "viviendas con apoyo asistencial",
            "assistenza alla fragilità": "apoyo a personas en situación de vulnerabilidad",
            "lettura operativa": "interpretación operativa",
            "supporto osservativo": "apoyo para la observación",
            "baseline individuale": "línea de base individual",
            "derive": "desviaciones respecto a la línea de base individual",
            "persone seguite": "personas atendidas",
            "persona seguita": "persona atendida",
            "badanti": "asistentes domiciliarios",
            "figure autorizzate": "profesionales autorizados",
            "al lordo di": "antes de descontar",
            "valorizzazione interna prudente": "valoración interna prudente",
            "banca dati": "conjunto de datos longitudinal",
        },
        "manual": {
            "Dai segnali": "De las señales",
            "alla lettura operativa.": "a la interpretación operativa.",
            "Perché nasce": "Por qué existe",
            "Origine": "Origen",
            "Mercato": "Mercado",
            "Trial": "Ensayo",
            "Economia": "Modelo económico",
            "Sistema": "Sistema",
            "Confronto": "Comparación",
            "Stato": "Estado actual",
            "Contatto": "Contacto",
            "Area privata": "Área privada",
            "Scrivi ora": "Contáctanos",
            "Nome e cognome": "Nombre y apellidos",
            "Tipo contatto": "Tipo de contacto",
            "Azienda / ente": "Empresa / entidad",
            "Email per ricontatto": "Correo electrónico",
            "Telefono per ricontatto": "Teléfono de contacto",
            "Preferenza": "Método de contacto preferido",
            "Risposta via email": "Respuesta por correo electrónico",
            "Richiamatemi telefonicamente": "Llámenme por teléfono",
            "Messaggio": "Mensaje",
            "Allegati": "Archivos adjuntos",
            "Privato": "Particular",
            "Non diagnostico": "No diagnóstico",
            "Attivo": "Activo",
            "In sviluppo": "En desarrollo",
            "Su misura": "A medida",
            "Come funziona": "Cómo funciona",
            "Stato attuale": "Estado actual",
            "Visione": "Visión",
        },
    },
    "ar": {
        "file": "ar.html",
        "dir": "rtl",
        "glossary": {
            "residenze sanitarie assistenziali per anziani": "مرافق الرعاية السكنية ودور رعاية كبار السن",
            "RSA": "مرافق الرعاية السكنية لكبار السن",
            "appartamenti protetti": "شقق سكنية مدعومة بالرعاية",
            "assistenza alla fragilità": "دعم الأشخاص في حالات الهشاشة",
            "lettura operativa": "فهم تشغيلي",
            "supporto osservativo": "دعم الرصد والملاحظة",
            "baseline individuale": "خط الأساس الفردي",
            "derive": "الانحرافات عن خط الأساس الفردي",
            "persone seguite": "الأشخاص المستفيدون من الدعم",
            "persona seguita": "الشخص المستفيد من الدعم",
            "badanti": "مقدمو الرعاية المنزلية",
            "figure autorizzate": "المختصون المخولون",
            "al lordo di": "قبل خصم",
            "valorizzazione interna prudente": "تقييم داخلي متحفظ",
            "banca dati": "مجموعة بيانات طولية",
        },
        "manual": {
            "Dai segnali": "من الإشارات",
            "alla lettura operativa.": "إلى فهمٍ تشغيلي.",
            "Perché nasce": "لماذا وُجد",
            "Origine": "النشأة",
            "Mercato": "السوق",
            "Trial": "التجربة الميدانية",
            "Economia": "النموذج الاقتصادي",
            "Sistema": "النظام",
            "Confronto": "المقارنة",
            "Stato": "الوضع الحالي",
            "Contatto": "اتصل بنا",
            "Area privata": "المنطقة الخاصة",
            "Scrivi ora": "تواصل معنا",
            "Nome e cognome": "الاسم الكامل",
            "Tipo contatto": "نوع التواصل",
            "Azienda / ente": "الشركة / المؤسسة",
            "Email per ricontatto": "البريد الإلكتروني للتواصل",
            "Telefono per ricontatto": "رقم الهاتف للتواصل",
            "Preferenza": "طريقة التواصل المفضلة",
            "Risposta via email": "الرد عبر البريد الإلكتروني",
            "Richiamatemi telefonicamente": "اتصلوا بي هاتفياً",
            "Messaggio": "الرسالة",
            "Allegati": "المرفقات",
            "Privato": "فرد",
            "Non diagnostico": "غير مخصص للتشخيص",
            "Attivo": "نشط",
            "In sviluppo": "قيد التطوير",
            "Su misura": "مصمم حسب الحاجة",
            "Come funziona": "كيف يعمل",
            "Stato attuale": "الوضع الحالي",
            "Visione": "الرؤية",
        },
    },
}

SKIP_TAGS = {"script", "style", "svg", "path", "code", "pre", "noscript"}
SKIP_EXACT = {
    "NeuroSuite", "MUSE", "EEG", "ERP", "MCI", "ISTAT", "AGENAS",
    "CERGAS SDA Bocconi", "NeuroVision GDO", "Bresciaoggi",
    "Lombardia Sociale", "EN", "IT", "ES", "العربية",
}
ATTRS = ("aria-label", "title", "placeholder", "alt")

try:
    cache = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
except Exception:
    cache = {}

def translatable(text):
    value = text.strip()
    if not value or value in SKIP_EXACT:
        return False
    if value.startswith(("http://", "https://", "mailto:", "tel:", "#")):
        return False
    if "@" in value and " " not in value:
        return False
    return any(ch.isalpha() for ch in value)

def protect_glossary(text, glossary):
    protected = text
    tokens = {}
    ordered = sorted(glossary.items(), key=lambda item: len(item[0]), reverse=True)
    for number, (italian, translated) in enumerate(ordered):
        pattern = re.compile(r"(?<!\w)" + re.escape(italian) + r"(?!\w)", re.IGNORECASE)
        if pattern.search(protected):
            token = f"ZXTERM{number}ZX"
            protected = pattern.sub(token, protected)
            tokens[token] = translated
    return protected, tokens

def restore_tokens(text, tokens):
    result = text
    for token, translated in tokens.items():
        result = re.sub(
            re.escape(token).replace("ZX", r"ZX\s*"),
            translated,
            result,
            flags=re.IGNORECASE,
        )
        result = result.replace(token, translated)
    return result

def translate_text(text, lang, config, translator):
    stripped = text.strip()

    if stripped in config["manual"]:
        return config["manual"][stripped]

    key = f"{lang}|{stripped}"
    if key in cache:
        return cache[key]

    prepared, tokens = protect_glossary(stripped, config["glossary"])

    for attempt in range(5):
        try:
            translated = translator.translate(prepared)
            translated = restore_tokens(translated, tokens)
            translated = re.sub(r"\s+([,.;:!?])", r"\1", translated)
            translated = re.sub(r"[ \t]{2,}", " ", translated).strip()
            cache[key] = translated
            CACHE_FILE.write_text(
                json.dumps(cache, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            time.sleep(0.15)
            return translated
        except Exception:
            if attempt == 4:
                raise
            time.sleep(2 + attempt * 2)

def replace_node(node, translated):
    raw = str(node)
    prefix = raw[: len(raw) - len(raw.lstrip())]
    suffix = raw[len(raw.rstrip()):]
    node.replace_with(NavigableString(prefix + translated + suffix))

def build_language(lang, config):
    print(f"\n=== Revisione {lang.upper()} ===")
    soup = BeautifulSoup(source_html, "html.parser")
    soup.html["lang"] = lang
    soup.html["dir"] = config["dir"]

    translator = GoogleTranslator(source="it", target=lang)

    nodes = []
    for node in soup.find_all(string=True):
        if not node.parent or node.parent.name in SKIP_TAGS:
            continue
        if translatable(str(node)):
            nodes.append(node)

    total = len(nodes)
    for index, node in enumerate(nodes, 1):
        translated = translate_text(str(node), lang, config, translator)
        replace_node(node, translated)
        if index % 20 == 0 or index == total:
            print(f"Tradotti e revisionati {index}/{total}")

    for tag in soup.find_all(True):
        if tag.name in SKIP_TAGS:
            continue
        for attr in ATTRS:
            value = tag.get(attr)
            if isinstance(value, str) and translatable(value):
                tag[attr] = translate_text(value, lang, config, translator)

    for meta in soup.find_all("meta"):
        key = meta.get("name") or meta.get("property")
        value = meta.get("content")
        if key in {
            "description", "og:title", "og:description",
            "twitter:title", "twitter:description",
        } and isinstance(value, str) and translatable(value):
            meta["content"] = translate_text(value, lang, config, translator)

    for link in soup.select("[data-language]"):
        classes = [c for c in link.get("class", []) if c != "active"]
        if classes:
            link["class"] = classes
        elif link.has_attr("class"):
            del link["class"]
        link.attrs.pop("aria-current", None)

        if link.get("data-language") == lang:
            link["class"] = link.get("class", []) + ["active"]
            link["aria-current"] = "page"

    language_script = soup.find(id="ns-language-script")
    if language_script and language_script.string:
        script = language_script.string
        script = re.sub(
            r'var current="(?:en|it|es|ar)";',
            f'var current="{lang}";',
            script,
        )
        language_script.string.replace_with(script)

    rtl_style = soup.find(id="ns-final-rtl-style")
    if rtl_style:
        rtl_style.decompose()

    style = soup.new_tag("style", id="ns-final-rtl-style")
    style.string = """
html[dir="rtl"] body,
html[dir="rtl"] main,
html[dir="rtl"] section,
html[dir="rtl"] header,
html[dir="rtl"] footer {
  direction: rtl;
}
html[dir="rtl"] h1,
html[dir="rtl"] h2,
html[dir="rtl"] h3,
html[dir="rtl"] h4,
html[dir="rtl"] p,
html[dir="rtl"] label,
html[dir="rtl"] .eyebrow {
  text-align: right;
}
html[dir="rtl"] input,
html[dir="rtl"] textarea,
html[dir="rtl"] select {
  direction: rtl;
  text-align: right;
}
html[dir="rtl"] .ns-language-switcher {
  direction: ltr;
}
.ns-language-switcher {
  flex-shrink: 0;
}
@media (max-width: 720px) {
  .ns-language-switcher a {
    min-width: 28px;
    padding-left: 5px;
    padding-right: 5px;
  }
  html[dir="rtl"] .hero__title {
    font-size: clamp(3rem, 15vw, 5.6rem);
    line-height: .96;
  }
}
"""
    soup.head.append(style)

    output = "<!doctype html>\n" + str(soup).split("<!DOCTYPE html>")[-1].lstrip()
    Path(config["file"]).write_text(output, encoding="utf-8")
    print(f"Creato: {config['file']}")

for language, configuration in LANGUAGES.items():
    build_language(language, configuration)

print("\n=== Controllo strutturale ===")

def audit(path, expected_lang, expected_dir):
    content = Path(path).read_text(encoding="utf-8")
    soup = BeautifulSoup(content, "html.parser")

    errors = []

    if soup.html.get("lang") != expected_lang:
        errors.append(f"lang errato: {soup.html.get('lang')}")
    if soup.html.get("dir") != expected_dir:
        errors.append(f"dir errato: {soup.html.get('dir')}")
    if not soup.select_one(".ns-language-switcher"):
        errors.append("selettore lingua assente")
    if not soup.select_one(f'[data-language="{expected_lang}"].active'):
        errors.append("lingua attiva errata")
    if expected_lang != "it" and re.search(r"\bRSA\b", soup.get_text(" ")):
        errors.append("acronimo RSA italiano ancora presente")
    if expected_lang == "en" and "Give signals" in content:
        errors.append("Give signals ancora presente")
    if expected_lang == "en" and "operational reading" in content.lower():
        errors.append("operational reading ancora presente")
    if expected_lang == "en" and "protected apartments" in content.lower():
        errors.append("protected apartments ancora presente")
    if expected_lang == "en" and "Because it was born" in content:
        errors.append("Because it was born ancora presente")
    if expected_lang == "ar":
        if not re.search(r"[\u0600-\u06FF]", soup.get_text(" ")):
            errors.append("testo arabo assente")
        if "text-align: right" not in content:
            errors.append("regole RTL incomplete")

    visible = [
        n for n in soup.find_all(string=True)
        if n.parent and n.parent.name not in SKIP_TAGS and n.strip()
    ]

    print(
        f"{path}: lang={expected_lang}, dir={expected_dir}, "
        f"blocchi={len(visible)}, errori={len(errors)}"
    )
    for error in errors:
        print("  ERRORE:", error)

    return errors

all_errors = []
all_errors += audit("index.html", "en", "ltr")
all_errors += audit("es.html", "es", "ltr")
all_errors += audit("ar.html", "ar", "rtl")
all_errors += audit("it.html", "it", "ltr")

if all_errors:
    raise SystemExit("\nCONTROLLO FALLITO: nessun commit eseguito")

print("\nCONTROLLO TESTUALE E STRUTTURALE SUPERATO")
