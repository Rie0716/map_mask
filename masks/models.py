from django.db import models

class Mask(models.Model):
    store = models.CharField("店名", max_length=50)
    status = models.CharField("在庫状況", max_length=20)
    update_at = models.DateTimeField("投稿時間", auto_now=True)
    difference = models.IntegerField("日数差", default=0)
    lat = models.DecimalField("緯度", max_digits=10, decimal_places=7, default=0)
    lng = models.DecimalField("経度", max_digits=10, decimal_places=7, default=0)
    
    def __str__(self):
        return f"store: {self.store} status: {self.status} update_at: {self.update_at} difference: {self.difference}"