import os
import csv
import requests
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CityTemp
from .serializers import CityTempSerializer


class CityTempViewSet(viewsets.ModelViewSet):
    queryset = CityTemp.objects.all()
    serializer_class = CityTempSerializer
    
    def get_queryset(self):
        queryset = CityTemp.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(city_name__icontains=search)
        return queryset

    @action(detail=False, methods=['get'])
    def by_city(self, request):
        """Returns city suggestions based on partial name match"""
        name = request.query_params.get('name', '').strip()
        if not name:
            return Response([])
        
        items = CityTemp.objects.filter(city_name__icontains=name).order_by('city_name')[:20]
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


def index(request):
    """Home page with city input form"""
    return render(request, 'weatherapp/index.html')


def dashboard(request):
    """Dashboard page with data visualization"""
    return render(request, 'weatherapp/dashboard.html')


def export_csv(request):
    """Export all city temperature data as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="citytemps.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'City Name', 'Temperature (°C)', 'Created At', 'Updated At'])
    
    for city in CityTemp.objects.all().order_by('-updated_at'):
        writer.writerow([
            city.id,
            city.city_name,
            city.temperature if city.temperature is not None else '',
            city.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            city.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return response


@require_GET
def fetch_weather(request):
    """Fetch current weather from OpenWeatherMap API and save to database"""
    city = request.GET.get('city', '').strip()
    if not city:
        return JsonResponse({'error': 'City parameter is required'}, status=400)

    api_key = os.getenv('OPENWEATHER_API_KEY')
    if not api_key:
        return JsonResponse({
            'error': 'OpenWeatherMap API key not configured',
            'details': 'Please set OPENWEATHER_API_KEY in .env file'
        }, status=500)

    # Fetch weather data from OpenWeatherMap
    units = request.GET.get('units', 'metric')
    base_url = os.getenv('OPENWEATHER_BASE', 'https://api.openweathermap.org/data/2.5')
    url = f"{base_url}/weather"
    params = {
        'q': city,
        'appid': api_key,
        'units': units
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extract temperature
        temperature = None
        if 'main' in data and 'temp' in data['main']:
            temperature = float(data['main']['temp'])

        # Get proper city name from API response
        city_name = data.get('name', city)

        # Find existing record (case-insensitive)
        existing = CityTemp.objects.filter(city_name__iexact=city_name).first()

        if existing:
            # Update existing record
            existing.city_name = city_name
            existing.temperature = temperature
            existing.save()
            obj = existing
            created = False
        else:
            # Create new record
            obj = CityTemp.objects.create(
                city_name=city_name,
                temperature=temperature
            )
            created = True

        return JsonResponse({
            'city_name': obj.city_name,
            'temperature': obj.temperature,
            'created': created,
            'id': obj.id,
            'raw': {
                'description': data.get('weather', [{}])[0].get('description', ''),
                'humidity': data.get('main', {}).get('humidity'),
                'pressure': data.get('main', {}).get('pressure'),
            }
        })

    except requests.exceptions.HTTPError as e:
        error_msg = 'Weather API error'
        if response.status_code == 404:
            error_msg = f'City "{city}" not found'
        elif response.status_code == 401:
            error_msg = 'Invalid API key'
        
        return JsonResponse({
            'error': error_msg,
            'details': str(e),
            'status_code': response.status_code
        }, status=502)

    except requests.exceptions.RequestException as e:
        return JsonResponse({
            'error': 'Failed to connect to weather service',
            'details': str(e)
        }, status=503)

    except Exception as e:
        return JsonResponse({
            'error': 'Unexpected error occurred',
            'details': str(e)
        }, status=500)