from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .parsers import Parsers
from SeoProjectApp.models import AuditDetails # Importez votre modèle ici

@api_view(['POST'])
def analyzer(request):
    url = request.data.get('url')
    if not url:
        return Response({"error": "URL manquante"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Analyse : Playwright extrait les données et se ferme
        parser = Parsers(url)
        result = parser.analyse_complete()  

        # 2. Enregistrement : On le fait ici, APRES que Playwright ait fini
        # Cela évite le conflit de contexte asynchrone
        AuditDetails.objects.create(
            url=url,
            is_secure=result["is_secure"],
            response_time=result["temps_reponse_ms"],
            http_status=result["http_status"],
            word_count=result["word_count"], # Assurez-vous que cette clé existe
            top_keywords=(result["top_keywords"]),
            title=result["titre"],
            title_length=result["longueur_titre"],
            meta_description=result["meta_description"],
            meta_description_length=result["longueur_meta_description"],
            h1_count=result["paragraphes"]["h1_count"],
            h2_count=result["paragraphes"]["h2_count"],
            h3_count=result["paragraphes"]["h3_count"],
            internal_links=",".join(result["liens_internes"]),
            external_links=",".join(result["liens_externes"]),
            images_count=result["nombre_images"],
            images_with_alt=len(result["images_avec_alt"]),
            seo_score=result["score_seo"],  
        )

        return Response(result, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
def analyser_liste(request):
    audits = AuditDetails.objects.all().values()
    return Response(list(audits), status=status.HTTP_200_OK)