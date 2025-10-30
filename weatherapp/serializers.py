from rest_framework import serializers
from .models import CityTemp

class CityTempSerializer(serializers.ModelSerializer):
    class Meta:
        model = CityTemp
        fields = ['id', 'city_name', 'temperature', 'created_at', 'updated_at']
