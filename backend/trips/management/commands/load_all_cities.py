# trips/management/commands/load_all_cities.py
from django.core.management.base import BaseCommand
from trips.models import CityCoordinate

class Command(BaseCommand):
    help = 'Load ALL US cities and states coordinates'
    
    def handle(self, *args, **options):
        # TOUTES les villes principales US + capitales d'état
        cities_data = [
            # Capitales d'état
            ('montgomery', 'al', 32.3770, -86.3006), ('juneau', 'ak', 58.3016, -134.4197),
            ('phoenix', 'az', 33.4484, -112.0740), ('little rock', 'ar', 34.7465, -92.2896),
            ('sacramento', 'ca', 38.5816, -121.4944), ('denver', 'co', 39.7392, -104.9903),
            ('hartford', 'ct', 41.7637, -72.6851), ('dover', 'de', 39.1582, -75.5244),
            ('tallahassee', 'fl', 30.4383, -84.2807), ('atlanta', 'ga', 33.7490, -84.3880),
            ('honolulu', 'hi', 21.3070, -157.8584), ('boise', 'id', 43.6178, -116.1996),
            ('springfield', 'il', 39.7980, -89.6440), ('indianapolis', 'in', 39.7684, -86.1581),
            ('des moines', 'ia', 41.5908, -93.6208), ('topeka', 'ks', 39.0473, -95.6752),
            ('frankfort', 'ky', 38.1868, -84.8753), ('baton rouge', 'la', 30.4571, -91.1874),
            ('augusta', 'me', 44.3070, -69.7816), ('annapolis', 'md', 38.9784, -76.4922),
            ('boston', 'ma', 42.3601, -71.0589), ('lansing', 'mi', 42.7335, -84.5555),
            ('st paul', 'mn', 44.9551, -93.1022), ('jackson', 'ms', 32.2988, -90.1848),
            ('jefferson city', 'mo', 38.5767, -92.1735), ('helena', 'mt', 46.5891, -112.0393),
            ('lincoln', 'ne', 40.8081, -96.6997), ('carson city', 'nv', 39.1638, -119.7664),
            ('concord', 'nh', 43.2081, -71.5376), ('trenton', 'nj', 40.2206, -74.7597),
            ('santa fe', 'nm', 35.6822, -105.9397), ('albany', 'ny', 42.6526, -73.7562),
            ('raleigh', 'nc', 35.7796, -78.6382), ('bismarck', 'nd', 46.8208, -100.7837),
            ('columbus', 'oh', 39.9612, -82.9988), ('oklahoma city', 'ok', 35.4676, -97.5164),
            ('salem', 'or', 44.9429, -123.0351), ('harrisburg', 'pa', 40.2732, -76.8867),
            ('providence', 'ri', 41.8236, -71.4222), ('columbia', 'sc', 33.9980, -81.0458),
            ('pierre', 'sd', 44.3668, -100.3538), ('nashville', 'tn', 36.1627, -86.7816),
            ('austin', 'tx', 30.2672, -97.7431), ('salt lake city', 'ut', 40.7608, -111.8910),
            ('montpelier', 'vt', 44.2601, -72.5754), ('richmond', 'va', 37.5407, -77.4360),
            ('olympia', 'wa', 47.0379, -122.9007), ('charleston', 'wv', 38.3498, -81.6326),
            ('madison', 'wi', 43.0731, -89.4012), ('cheyenne', 'wy', 41.1399, -104.8202),
            ('washington', 'dc', 38.9072, -77.0369),
            
            # Grandes villes principales
            ('new york', 'ny', 40.7128, -74.0060), ('los angeles', 'ca', 34.0522, -118.2437),
            ('chicago', 'il', 41.8781, -87.6298), ('houston', 'tx', 29.7604, -95.3698),
            ('phoenix', 'az', 33.4484, -112.0740), ('philadelphia', 'pa', 39.9526, -75.1652),
            ('san antonio', 'tx', 29.4241, -98.4936), ('san diego', 'ca', 32.7157, -117.1611),
            ('dallas', 'tx', 32.7767, -96.7970), ('san jose', 'ca', 37.3382, -121.8863),
            ('austin', 'tx', 30.2672, -97.7431), ('jacksonville', 'fl', 30.3322, -81.6557),
            ('fort worth', 'tx', 32.7555, -97.3308), ('columbus', 'oh', 39.9612, -82.9988),
            ('charlotte', 'nc', 35.2271, -80.8431), ('san francisco', 'ca', 37.7749, -122.4194),
            ('indianapolis', 'in', 39.7684, -86.1581), ('seattle', 'wa', 47.6062, -122.3321),
            ('denver', 'co', 39.7392, -104.9903), ('washington', 'dc', 38.9072, -77.0369),
            ('boston', 'ma', 42.3601, -71.0589), ('el paso', 'tx', 31.7619, -106.4850),
            ('detroit', 'mi', 42.3314, -83.0458), ('nashville', 'tn', 36.1627, -86.7816),
            ('portland', 'or', 45.5152, -122.6784), ('memphis', 'tn', 35.1495, -90.0490),
            ('oklahoma city', 'ok', 35.4676, -97.5164), ('las vegas', 'nv', 36.1699, -115.1398),
            ('louisville', 'ky', 38.2527, -85.7585), ('baltimore', 'md', 39.2904, -76.6122),
            ('milwaukee', 'wi', 43.0389, -87.9065), ('albuquerque', 'nm', 35.0844, -106.6504),
            ('tucson', 'az', 32.2226, -110.9747), ('fresno', 'ca', 36.7378, -119.7871),
            ('sacramento', 'ca', 38.5816, -121.4944), ('kansas city', 'mo', 39.0997, -94.5786),
            ('atlanta', 'ga', 33.7490, -84.3880), ('miami', 'fl', 25.7617, -80.1918),
            ('cleveland', 'oh', 41.4993, -81.6944), ('new orleans', 'la', 29.9511, -90.0715),
    
            # Villes supplémentaires importantes
            ('orlando', 'fl', 28.5384, -81.3789), ('tampa', 'fl', 27.9506, -82.4572),
            ('pittsburgh', 'pa', 40.4406, -79.9959), ('cincinnati', 'oh', 39.1031, -84.5120),
            ('minneapolis', 'mn', 44.9778, -93.2650), ('st louis', 'mo', 38.6270, -90.1994),
            ('kansas city', 'ks', 39.1142, -94.6275), ('newark', 'nj', 40.7357, -74.1724),
            ('buffalo', 'ny', 42.8864, -78.8784), ('tulsa', 'ok', 36.1540, -95.9928),
            ('arlington', 'tx', 32.7357, -97.1081), ('anaheim', 'ca', 33.8366, -117.9143),
            ('riverside', 'ca', 33.9806, -117.3755), ('corpus christi', 'tx', 27.8006, -97.3964),
            ('lexington', 'ky', 38.0406, -84.5037), ('stockton', 'ca', 37.9577, -121.2908),
            ('wichita', 'ks', 37.6922, -97.3375), ('irving', 'tx', 32.8140, -96.9489),
            ('durham', 'nc', 35.9940, -78.8986), ('lubbock', 'tx', 33.5779, -101.8552),
            ('laredo', 'tx', 27.5036, -99.5076), ('madison', 'wi', 43.0731, -89.4012),
            ('chandler', 'az', 33.3062, -111.8413), ('plano', 'tx', 33.0198, -96.6989),
            ('greensboro', 'nc', 36.0726, -79.7920), ('lincoln', 'ne', 40.8136, -96.7026),
            ('henderson', 'nv', 36.0395, -114.9817), ('orlando', 'fl', 28.5384, -81.3789),
            ('tampa', 'fl', 27.9506, -82.4572), ('st petersburg', 'fl', 27.7676, -82.6403),
            ('reno', 'nv', 39.5296, -119.8138), ('durham', 'nc', 35.9940, -78.8986),
                        ('biloxi', 'ms', 30.3960, -88.8853),
            ('mobile', 'al', 30.6954, -88.0399),
            ('pensacola', 'fl', 30.4213, -87.2169),
            ('gulfport', 'ms', 30.3674, -89.0928),
            ('montgomery', 'al', 32.3792, -86.3077),
            ('birmingham', 'al', 33.5186, -86.8104),
            ('huntsville', 'al', 34.7304, -86.5861),
            ('chattanooga', 'tn', 35.0456, -85.3097),
            ('knoxville', 'tn', 35.9606, -83.9207),
            ('asheville', 'nc', 35.5951, -82.5515),
            ('greenville', 'sc', 34.8526, -82.3940),
            ('spartanburg', 'sc', 34.9496, -81.9320),
            ('augusta', 'ga', 33.4709, -81.9748),
            ('columbia', 'sc', 34.0007, -81.0348),
            ('florence', 'sc', 34.1954, -79.7626),
            ('fayetteville', 'nc', 35.0527, -78.8784),
            ('wilmington', 'nc', 34.2104, -77.8868),
            ('myrtle beach', 'sc', 33.6891, -78.8867),
            ('savannah', 'ga', 32.0809, -81.0912),
            ('jacksonville', 'fl', 30.3322, -81.6557),
            ('daytona beach', 'fl', 29.2108, -81.0228),
            ('orlando', 'fl', 28.5383, -81.3792),
            ('tampa', 'fl', 27.9506, -82.4572),
            ('sarasota', 'fl', 27.3364, -82.5307),
            ('fort myers', 'fl', 26.6406, -81.8723),
            ('naples', 'fl', 26.1420, -81.7948),
            ('west palm beach', 'fl', 26.7153, -80.0534),
            ('fort lauderdale', 'fl', 26.1224, -80.1373),
            ('miami', 'fl', 25.7617, -80.1918),
        
        ]
        
        count = 0
        for city, state, lat, lng in cities_data:
            obj, created = CityCoordinate.objects.get_or_create(
                city=city,
                state=state,
                defaults={'latitude': lat, 'longitude': lng}
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {count} cities'))
        self.stdout.write(f'Total cities in database: {CityCoordinate.objects.count()}')