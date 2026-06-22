import 'package:latlong2/latlong.dart';

class RouteMapArgs {
  const RouteMapArgs({
    required this.title,
    required this.destination,
    required this.destinationLabel,
  });

  final String title;
  final LatLng destination;
  final String destinationLabel;
}
