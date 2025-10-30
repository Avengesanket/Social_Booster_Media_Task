from django.urls import path, include
from rest_framework import routers
from .views import CityTempViewSet, index, dashboard, export_csv, fetch_weather

router = routers.DefaultRouter()
router.register(r'api/citytemps', CityTempViewSet, basename='citytemps')

urlpatterns = [
    path('', index, name='index'),
    path('dashboard/', dashboard, name='dashboard'),
    path('export_csv/', export_csv, name='export_csv'),
    path('fetch_weather/', fetch_weather, name='fetch_weather'),
    path('', include(router.urls)),
]
