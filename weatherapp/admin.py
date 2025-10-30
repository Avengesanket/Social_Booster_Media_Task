from django.contrib import admin
from .models import CityTemp

@admin.register(CityTemp)
class CityTempAdmin(admin.ModelAdmin):
    list_display = ('id', 'city_name', 'temperature', 'updated_at')
    search_fields = ('city_name',)
