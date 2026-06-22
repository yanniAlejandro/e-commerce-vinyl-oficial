import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../models/route_map_args.dart';
import '../utils/location_utils.dart';

class RouteMapScreen extends StatefulWidget {
  const RouteMapScreen({super.key, required this.args});

  final RouteMapArgs args;

  @override
  State<RouteMapScreen> createState() => _RouteMapScreenState();
}

class _RouteMapScreenState extends State<RouteMapScreen> {
  final _mapController = MapController();
  LatLng? _current;
  List<LatLng> _route = [];
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  Future<void> _loadRoute() async {
    try {
      final position = await getCurrentPosition();
      final from = LatLng(position.latitude, position.longitude);
      final route = await fetchRoute(from, widget.args.destination);
      setState(() {
        _current = from;
        _route = route;
        _loading = false;
      });
      _fitBounds();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _fitBounds() {
    if (_current == null) return;
    final points = [..._route, _current!, widget.args.destination];
    final bounds = LatLngBounds.fromPoints(points);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _mapController.fitCamera(
        CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(48)),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.args.title.toUpperCase(), style: AppTypography.mono(size: 12)),
      ),
      body: _loading
          ? const QtbSpinner(label: 'Calculando ruta')
          : _error != null
              ? QtbEmptyState(title: 'Sin ruta', subtitle: _error)
              : FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _current ?? widget.args.destination,
                    initialZoom: 14,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                      subdomains: const ['a', 'b', 'c', 'd'],
                      userAgentPackageName: 'com.qtb.messenger',
                    ),
                    if (_route.isNotEmpty)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: _route,
                            strokeWidth: 3,
                            color: AppColors.text,
                          ),
                        ],
                      ),
                    MarkerLayer(
                      markers: [
                        if (_current != null)
                          Marker(
                            point: _current!,
                            width: 40,
                            height: 40,
                            child: const Icon(Icons.delivery_dining, color: AppColors.text, size: 32),
                          ),
                        Marker(
                          point: widget.args.destination,
                          width: 40,
                          height: 40,
                          child: const Icon(Icons.place, color: AppColors.accentRed, size: 32),
                        ),
                      ],
                    ),
                  ],
                ),
    );
  }
}
