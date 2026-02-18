import os
import time
from datetime import datetime
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

    def nombre_images(self):
        return len(self.soup.find_all("img"))
    
    def images_lazy_loading(self):
        lazy_images = []
        for img in self.soup.find_all("img"):
            if img.get("loading") == "lazy":
                # lazy_images.append(img)
                lazy_images.append({
                    "src": img.get("src", ""),
                    "alt": img.get("alt", ""),
                })
        return lazy_images

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
    
    
    def images_score(self):
        score = 0

        total_images = self.nombre_images()
        if total_images == 0:
            return 0  # aucune image = mauvais SEO

        # ---------- NOMBRE D'IMAGES (20 pts) ----------
        if total_images >= 3:
            score += 20
        elif total_images >= 1:
            score += 10

        # ---------- ALT (50 pts) ----------
        images_with_alt = len(self.extract_images_with_alt())
        alt_ratio = images_with_alt / total_images

        if alt_ratio == 1:
            score += 50
        elif alt_ratio >= 0.7:
            score += 30
        elif alt_ratio >= 0.3:
            score += 15
        elif alt_ratio > 0:
            score += 5

        # ---------- LAZY LOADING (30 pts) ----------
        lazy_count = len(self.images_lazy_loading())
        lazy_ratio = lazy_count / total_images

        if lazy_ratio >= 0.5:
            score += 30
        elif lazy_ratio >= 0.3:
            score += 20
        elif lazy_ratio >= 0.1:
            score += 10

        return score
    

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
    
    def nombre_liens(self):
      
       internal_links = self.extract_internal_links()
       external_links = self.extract_external_links()

       internal_count = len(internal_links)
       external_count = len(external_links)

       total_links = internal_count + external_count 

       return total_links 
    
    def links_score(self):
        score = 0

        internal_links = self.extract_internal_links()
        external_links = self.extract_external_links()

        internal_count = len(internal_links)
        external_count = len(external_links)
        total_links = internal_count + external_count

        if total_links == 0:
            return 0

        # ---------- LIENS INTERNES (50 pts) ----------
        if internal_count >= 10:
            score += 50
        elif internal_count >= 5:
            score += 30
        elif internal_count >= 1:
            score += 15

        # ---------- LIENS EXTERNES (30 pts) ----------
        if 1 <= external_count <= 5:
            score += 30
        elif external_count > 5:
            score += 20

        # ---------- ÉQUILIBRE (20 pts) ----------
        external_ratio = external_count / total_links

        if 0.10 <= external_ratio <= 0.40:
            score += 20
        elif 0.05 <= external_ratio <= 0.60:
            score += 10

        return score


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
    
    def meta_score(self):
        score = 0

        # ----- TITLE -----
        title_len = self.title_length()

        if 50 <= title_len <= 60:
            score += 50
        elif 40 <= title_len <= 70:
            score += 30
        elif title_len > 0:
            score += 10

        # ----- META DESCRIPTION -----
        meta_len = self.meta_description_length()

        if 140 <= meta_len <= 160:
            score += 50
        elif 120 <= meta_len <= 170:
            score += 30
        elif meta_len > 0:
            score += 10

        return score
        

    def count_heading(self):
        return {
            "h1_count": len(self.soup.find_all("h1")),
            "h2_count": len(self.soup.find_all("h2")),
            "h3_count": len(self.soup.find_all("h3")),
            "h4_count": len(self.soup.find_all("h4")),
            "h5_count": len(self.soup.find_all("h5")),
            "h6_count": len(self.soup.find_all("h6")),
        }
    
    def nombre_paragraphes(self):
     return len(self.soup.find_all("p"))


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
        score = 0
        details = {}

        # ---------- TECHNIQUE (25) ----------
        technique = 0

        if data.get("is_secure"):
            technique += 10

        temps = data.get("temps_reponse_ms", 3000)
        if temps < 500:
            technique += 15
        elif temps < 1000:
            technique += 10
        elif temps < 2000:
            technique += 5

        technique = min(technique, 25)
        score += technique
        details["technique"] = technique

        # ---------- META SEO (20) ----------
        meta_score = data.get("meta_seo_score", 0)
        meta_final = min(meta_score * 0.20, 20)
        score += meta_final
        details["meta"] = round(meta_final)

        # ---------- CONTENU (20) ----------
        contenu = 0
        words = data.get("word_count", 0)

        if words >= 600:
            contenu += 10
        elif words >= 300:
            contenu += 5

        title = (data.get("titre") or "").lower()
        for kw in data.get("top_keywords", [])[:3]:
            if kw.lower() in title:
                contenu += 10
                break

        contenu = min(contenu, 20)
        score += contenu
        details["contenu"] = contenu

        # ---------- IMAGES (15) ----------
        images_score = data.get("images_seo_score", 0)
        images_final = min(images_score * 0.15, 15)
        score += images_final
        details["images"] = round(images_final)

        # ---------- LIENS (10) ----------
        links_score = data.get("links_seo_score", 0)
        links_final = min(links_score * 0.10, 10)
        score += links_final
        details["liens"] = round(links_final)

        # ---------- STRUCTURE (10) ----------
        structure = 0
        h1 = data.get("paragraphes", {}).get("h1_count", 0)
        h2 = data.get("paragraphes", {}).get("h2_count", 0)

        if h1 == 1:
            structure += 5
        if h2 >= 2:
            structure += 5

        score += structure
        details["structure"] = structure

        return {
            "total": round(min(score, 100)),
           
        }
        
    def mobile_score(self, data):
        score = 0

        # ---------- HTTPS (10) ----------
        if data.get("is_secure"):
            score += 10

        # ---------- VITESSE (30) ----------
        temps = data.get("temps_reponse_ms", 3000)
        if temps < 500:
            score += 30
        elif temps < 1000:
            score += 20
        elif temps < 2000:
            score += 10

        # ---------- IMAGES (25) ----------
        images_score = data.get("images_seo_score", 0)
        score += min(images_score * 0.25, 25)

        # ---------- META (15) ----------
        meta_score = data.get("meta_seo_score", 0)
        score += min(meta_score * 0.15, 15)

        # ---------- LIENS (10) ----------
        links_score = data.get("links_seo_score", 0)
        score += min(links_score * 0.10, 10)

        # ---------- TEXTE (10) ----------
        words = data.get("word_count", 0)
        if words >= 300:
            score += 10
        elif words >= 150:
            score += 5

        return round(score)
    
    def desktop_score(self, data):
        score = 0

        # ---------- HTTPS (10) ----------
        if data.get("is_secure"):
            score += 10

        # ---------- VITESSE (20) ----------
        temps = data.get("temps_reponse_ms", 3000)
        if temps < 700:
            score += 20
        elif temps < 1500:
            score += 10

        # ---------- STRUCTURE (20) ----------
        h1 = data.get("paragraphes", {}).get("h1_count", 0)
        h2 = data.get("paragraphes", {}).get("h2_count", 0)

        if h1 == 1:
            score += 10
        if h2 >= 2:
            score += 10

        # ---------- META (20) ----------
        meta_score = data.get("meta_score", 0)
        score += min(meta_score * 0.20, 20)

        # ---------- LIENS (15) ----------
        links_score = data.get("links_seo_score", 0)
        score += min(links_score * 0.15, 15)

        # ---------- CONTENU (15) ----------
        words = data.get("word_count", 0)
        if words >= 600:
            score += 15
        elif words >= 300:
            score += 10

        return round(score)

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
                "images_lazy_loading": self.images_lazy_loading(),
                "images_avec_alt": self.extract_images_with_alt(),
                "titre": self.title(),
                "longueur_titre": self.title_length(),
                "meta_description": self.meta_description(),
                "longueur_meta_description": self.meta_description_length(),
                "meta_seo_score": self.meta_score(),
                "images_seo_score": self.images_score(),
                "links_seo_score": self.links_score(),
                "paragraphes": self.count_heading(),
                "nombre_paragraphes":self.nombre_paragraphes()
                
            }
            seo_result = self.calculer_score_seo(result)
            result["date_audit"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            result["mobile_score"] = self.mobile_score(result)
            result["desktop_score"] = self.desktop_score(result)
            result["score_seo"] = seo_result["total"]

            context.close()
            browser.close()

            return result
