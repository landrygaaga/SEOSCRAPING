from django.db import models

# Create your models here.
class AuditDetails(models.Model):

    detail_id = models.AutoField(primary_key=True)
    url = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    status = ( 
        ('success', 'Succés'),
        ('error', 'Erreur'),
     )
    is_secure = models.BooleanField(null=True)
    response_time = models.IntegerField(null=True)
    http_status = models.IntegerField(null=True)
    word_count = models.IntegerField(null=True)
    title = models.TextField(null=True)
    title_length = models.IntegerField(null=True)
    meta_description = models.TextField(null=True)
    meta_description_length = models.IntegerField(null=True)
    h1_count = models.IntegerField(null=True)
    h2_count = models.IntegerField(null=True)
    h3_count = models.IntegerField(null=True)
    h4_count = models.IntegerField(null=True)
    h5_count = models.IntegerField(null=True)
    h6_count = models.IntegerField(null=True)
    internal_links = models.TextField(null=True)
    external_links = models.TextField(null=True)
    images_count = models.IntegerField(null=True)
    images_with_alt = models.IntegerField(null=True)
    images_lazy_loading = models.IntegerField(null=True)
    top_keywords = models.TextField(null=True)
    meta_seo_score = models.IntegerField(null=True)
    images_seo_score = models.IntegerField(null=True)
    links_seo_score = models.IntegerField(null=True)
    desktop_score = models.IntegerField(null=True)
    mobile_score = models.IntegerField(null=True)
    date_audit = models.DateTimeField(null=True)
    seo_score = models.IntegerField(null=True)

