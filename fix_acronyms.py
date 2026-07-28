from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import re

CONFIG = {
    "it.html": {
        "lang": "it",
        "first": {
            "RSA": "Residenze Sanitarie Assistenziali (RSA)",
            "ADI": "Assistenza Domiciliare Integrata (ADI)",
            "GDO": "Grande Distribuzione Organizzata (GDO)",
            "EEG": "elettroencefalografia (EEG)",
            "ERP": "potenziali evento-correlati (ERP)",
            "MCI": "deterioramento cognitivo lieve (MCI)",
            "POC": "prova di fattibilità (POC)",
            "API": "interfacce di programmazione applicativa (API)",
            "AI": "intelligenza artificiale (AI)",
        },
    },
    "index.html": {
        "lang": "en",
        "all": {
            r"\bRSAs?\b": "residential care and nursing homes",
            r"\bADI\b": "integrated home-care services",
            r"\bGDO\b": "large-scale retail",
            r"\bIVA\b": "VAT",
        },
        "first": {
            "EEG": "electroencephalography (EEG)",
            "ERP": "event-related potentials (ERP)",
            "MCI": "mild cognitive impairment (MCI)",
            "POC": "proof of concept (PoC)",
            "API": "application programming interfaces (APIs)",
        },
        "phrases": {
            "RSAs are the first starting point.": "Residential care and nursing homes are the initial focus.",
            "protected apartments": "assisted-living apartments",
            "frailty assistance": "support for vulnerable people",
            "people followed": "people receiving support",
            "person followed": "person receiving support",
            "People followed in Integrated Home Care": "People receiving integrated home-care services",
            "Elderly people over 65 in RSA": "People aged 65 and over in residential care and nursing homes",
            "RSA and territory": "Residential care and community services",
            "healthcare system": "health and social-care system",
            "tight deadlines": "limited time",
            "reserved foundation": "second confidential foundation",
            "operational reading": "operational insight",
            "clinical-operational reading": "clinical and operational assessment",
            "drift reading": "detection of deviations from the individual baseline",
            "authorized figures": "authorised professionals",
        },
    },
    "es.html": {
        "lang": "es",
        "all": {
            r"\bRSAs?\b": "centros residenciales para personas mayores",
            r"\bADI\b": "atención domiciliaria integrada",
            r"\bGDO\b": "gran distribución",
            r"\bVAT\b": "IVA",
            r"\bAI\b": "IA",
        },
        "first": {
            "EEG": "electroencefalografía (EEG)",
            "ERP": "potenciales relacionados con eventos (PRE)",
            "MCI": "deterioro cognitivo leve (DCL)",
            "POC": "prueba de concepto (PdC)",
            "API": "interfaces de programación de aplicaciones (API)",
            "IA": "inteligencia artificial (IA)",
        },
        "phrases": {
            "apartamentos protegidos": "viviendas con apoyo asistencial",
            "asistencia a la fragilidad": "apoyo a personas en situación de vulnerabilidad",
            "personas seguidas": "personas atendidas",
            "persona seguida": "persona atendida",
            "lectura operativa": "interpretación operativa",
            "lectura clínico-operativa": "evaluación clínica y operativa",
            "figuras autorizadas": "profesionales autorizados",
        },
    },
    "ar.html": {
        "lang": "ar",
        "all": {
            r"\bRSAs?\b": "مرافق الرعاية السكنية وطويلة الأجل لكبار السن",
            r"\bADI\b": "خدمات الرعاية المنزلية المتكاملة",
            r"\bGDO\b": "قطاع التجزئة واسعة النطاق",
            r"\bVAT\b": "ضريبة القيمة المضافة",
            r"\bIVA\b": "ضريبة القيمة المضافة",
            r"\bAI\b": "الذكاء الاصطناعي",
        },
        "first": {
            "EEG": "تخطيط كهربية الدماغ (EEG)",
            "ERP": "الجهود الدماغية المرتبطة بالأحداث (ERP)",
            "MCI": "الضعف الإدراكي البسيط",
            "POC": "إثبات المفهوم",
            "API": "واجهات برمجة التطبيقات (API)",
        },
    },
}

SKIP = {"script", "style", "svg", "path", "code", "pre", "noscript"}

def visible_nodes(soup):
    return [
        node for node in soup.find_all(string=True)
        if node.parent and node.parent.name not in SKIP
    ]

def replace_preserving_space(node, new):
    raw = str(node)
    left = raw[:len(raw)-len(raw.lstrip())]
    right = raw[len(raw.rstrip()):]
    node.replace_with(NavigableString(left + new + right))

for filename, cfg in CONFIG.items():
    path = Path(filename)
    if not path.exists():
        raise SystemExit(f"File mancante: {filename}")

    soup = BeautifulSoup(path.read_text(encoding="utf-8-sig"), "html.parser")

    # Correzioni di frasi note.
    for node in visible_nodes(soup):
        value = str(node)
        corrected = value
        for old, new in cfg.get("phrases", {}).items():
            corrected = re.sub(re.escape(old), new, corrected, flags=re.IGNORECASE)
        if corrected != value:
            replace_preserving_space(node, corrected)

    # Elimina completamente le sigle italiane dalle versioni estere.
    for pattern, replacement in cfg.get("all", {}).items():
        for node in visible_nodes(soup):
            value = str(node)
            corrected = re.sub(pattern, replacement, value)
            if corrected != value:
                replace_preserving_space(node, corrected)

    # Espande le sigle internazionali alla prima occorrenza utile.
    for acronym, expansion in cfg.get("first", {}).items():
        expanded = False
        pattern = re.compile(rf"\b{re.escape(acronym)}\b")
        for node in visible_nodes(soup):
            if expanded:
                break
            value = str(node)
            if pattern.search(value):
                corrected = pattern.sub(expansion, value, count=1)
                replace_preserving_space(node, corrected)
                expanded = True

    if cfg["lang"] == "ar":
        soup.html["dir"] = "rtl"
        soup.html["lang"] = "ar"

    path.write_text(
        "<!doctype html>\n" + str(soup).split("<!DOCTYPE html>")[-1].lstrip(),
        encoding="utf-8",
    )
    print("Corretto:", filename)

# Controllo delle sigle incomprensibili nelle versioni estere.
checks = {
    "index.html": [
        r"\bRSA\b", r"\bRSAs\b", r"\bADI\b", r"\bGDO\b",
        "protected apartments", "people followed", "operational reading",
    ],
    "es.html": [r"\bRSA\b", r"\bRSAs\b", r"\bADI\b", r"\bGDO\b"],
    "ar.html": [r"\bRSA\b", r"\bRSAs\b", r"\bADI\b", r"\bGDO\b"],
}

errors = []
for filename, forbidden in checks.items():
    soup = BeautifulSoup(Path(filename).read_text(encoding="utf-8"), "html.parser")
    text = soup.get_text(" ", strip=True)
    for expression in forbidden:
        if re.search(expression, text, flags=re.IGNORECASE):
            errors.append(f"{filename}: termine residuo {expression}")

if errors:
    print("\nCONTROLLO FALLITO")
    for error in errors:
        print(error)
    raise SystemExit(1)

print("\nCONTROLLO SIGLE SUPERATO")
