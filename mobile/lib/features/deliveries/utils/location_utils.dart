import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

Future<Position> getCurrentPosition() async {
  var permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
  }
  if (permission == LocationPermission.denied ||
      permission == LocationPermission.deniedForever) {
    throw Exception('Permiso de ubicación denegado');
  }
  return Geolocator.getCurrentPosition();
}

Future<List<LatLng>> fetchRoute(LatLng from, LatLng to) async {
  final dio = Dio();
  final url =
      'https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson';
  try {
    final response = await dio.get(url);
    final coords = response.data['routes'][0]['geometry']['coordinates'] as List;
    return coords
        .map((c) => LatLng((c[1] as num).toDouble(), (c[0] as num).toDouble()))
        .toList();
  } catch (_) {
    return [from, to];
  }
}
