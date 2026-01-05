import os
import time
import pandas as pd
import advertools as adv
from urllib.parse import urlparse, urljoin
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from keybert import KeyBERT
import spacy

# Initialisation unique (performance)
kw_model = KeyBERT(model='distiluse-base-multilingual-cased-v1')
nlp = spacy.load("fr_core_news_lg")


class Parsers:
    def __init__(self, url):
        self.url = url
        self.soup = None

    # UTILITAIRES 

    def _validate_url(self):
        parsed = urlparse(self.url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError("Invalid URL")

    def _check_response(self, response):
        if response is None:
            raise Exception("Aucune réponse HTTP")
        if response.status != 200:
            raise Exception(f"Statut HTTP inattendu: {response.status}")

    def response_time(self, start_time):
        return round((time.time() - start_time) * 1000)

    def http_status(self, response):
        return response.status

    def is_secure(self):
        return self.url.startswith("https://")

    def page_size(self, html_content):
        return len(html_content.encode("utf-8"))

    def final_url(self, page):
        return page.url

    #  EXTRACTIONS HTML 

    def nombre_liens(self):
        return len(self.soup.find_all("a"))

    def nombre_images(self):
        return len(self.soup.find_all("img"))

    def extract_images_with_alt(self):
        unique_alts = set()
        images = []

        for img in self.soup.find_all("img"):
            alt = img.get("alt")
            if alt:
                alt = alt.strip()
                if alt not in unique_alts:
                    unique_alts.add(alt)
                    images.append({"alt": alt})
        return images

    def extract_internal_links(self):
        base_domain = urlparse(self.url).netloc
        internal_links = set()

        for a in self.soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            full_url = urljoin(self.url, href)
            if urlparse(full_url).netloc == base_domain:
                internal_links.add(full_url)

        return list(internal_links)

    def extract_external_links(self):
        base_domain = urlparse(self.url).netloc
        external_links = set()

        for a in self.soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            full_url = urljoin(self.url, href)
            if urlparse(full_url).netloc != base_domain:
                external_links.add(full_url)

        return list(external_links)

    def title(self):
        tag = self.soup.find("title")
        return tag.get_text(strip=True) if tag else None

    def title_length(self):
        return len(self.title() or "")

    def meta_description(self):
        tag = self.soup.find("meta", attrs={"name": "description"})
        return tag.get("content", "").strip() if tag else None

    def meta_description_length(self):
        return len(self.meta_description() or "")

    def count_heading(self):
        return {
            "h1_count": len(self.soup.find_all("h1")),
            "h2_count": len(self.soup.find_all("h2")),
            "h3_count": len(self.soup.find_all("h3")),
        }

    # TEXTE & MOTS-CLÉS 

    def extract_keywords(self):
        meta = self.soup.find("meta", attrs={"name": "keywords"})
        if meta and meta.get("content"):
            return [kw.strip() for kw in meta["content"].split(",") if kw.strip()]
        return []

    def extract_text(self):
        temp = BeautifulSoup(str(self.soup), "html.parser")
        for tag in temp(["script", "style", "noscript", "header", "footer", "nav"]):
            tag.decompose()
        return " ".join(temp.get_text(separator=" ").split())

    def extract_keywords_keybert(self, top_n=10):
        text = self.extract_text()
        if len(text) < 50:
            return []

        doc = nlp(text)
        filtered = " ".join([
            t.text for t in doc
            if t.pos_ in ["NOUN", "PROPN", "ADJ"]
            and not t.is_stop and len(t.text) > 2
        ])

        if not filtered:
            return []

        keywords = kw_model.extract_keywords(
            filtered,
            keyphrase_ngram_range=(1, 2),
            stop_words=None,
            top_n=top_n
        )

        return [kw for kw, _ in keywords]

    def get_keywords(self):
        return self.extract_keywords() or self.extract_keywords_keybert()

    #  ADVERTOOLS 

    def get_advertools_data(self):
        try:
            adv.crawl(self.url, 'temp_crawl.jl', follow_links=False)
            time.sleep(2)

            if not os.path.exists('temp_crawl.jl'):
                return {}

            df = pd.read_json('temp_crawl.jl', lines=True)
            os.remove('temp_crawl.jl')

            return df.iloc[0].to_dict() if not df.empty else {}
        except Exception:
            return {}

    # SCORE SEO 

    def calculer_score_seo(self, data):
        details = {"technique": 0, "contenu": 0, "structure": 0}

        if data.get("is_secure"):
            details["technique"] += 10
        if data.get("temps_reponse_ms", 2000) < 1000:
            details["technique"] += 20

        h1_count = data.get("paragraphes", {}).get("h1_count", 0)
        if h1_count == 1:
            details["structure"] += 20
        elif h1_count > 1:
            details["structure"] += 5

        if data.get("word_count", 0) > 600:
            details["contenu"] += 20

        title = (data.get("titre") or "").lower()
        for kw in data.get("top_keywords", [])[:3]:
            if kw.lower() in title:
                details["contenu"] += 15
                break

        return {"total": sum(details.values()), "breakdown": details}

    # ANALYSE COMPLETE

    def analyse_complete(self):
        self._validate_url()
        

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()

            start_time = time.time()
            response = page.goto(self.url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_selector("body")
            time.sleep(2)

            self._check_response(response)

            self.soup = BeautifulSoup(page.content(), "html.parser")
            texte = self.extract_text()

            internal_links = self.extract_internal_links()
            external_links = self.extract_external_links()

            result = {
                "is_secure": self.is_secure(),
                "http_status": self.http_status(response),
                "temps_reponse_ms": self.response_time(start_time),
                "taille_page_octets": self.page_size(page.content()),
                "url_finale": self.final_url(page),
                "word_count": len(texte.split()),
                "top_keywords": self.get_keywords(),
                "nombre_liens": self.nombre_liens(),
                "liens_internes": internal_links,
                "nombre_liens_internes": len(internal_links),
                "liens_externes": external_links,
                "nombre_liens_externes": len(external_links),
                "nombre_images": self.nombre_images(),
                "images_avec_alt": self.extract_images_with_alt(),
                "titre": self.title(),
                "longueur_titre": self.title_length(),
                "meta_description": self.meta_description(),
                "longueur_meta_description": self.meta_description_length(),
                "paragraphes": self.count_heading(),
                
            }

            result["score_seo"] = self.calculer_score_seo(result)

            context.close()
            browser.close()

            return result
