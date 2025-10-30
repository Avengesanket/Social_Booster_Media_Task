from django.db import models

class CityTemp(models.Model):
    city_name = models.CharField(max_length=200, db_index=True)
    temperature = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.city_name} — {self.temperature}°"
