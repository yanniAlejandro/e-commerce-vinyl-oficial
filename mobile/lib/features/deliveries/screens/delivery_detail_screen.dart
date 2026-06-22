import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/network/dio_client.dart';
import '../data/deliveries_repository.dart';
import '../models/delivery_order.dart';
import '../providers/deliveries_provider.dart';

class DeliveryDetailScreen extends ConsumerStatefulWidget {
  const DeliveryDetailScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends ConsumerState<DeliveryDetailScreen> {
  bool _acting = false;

  Future<void> _action(Future<void> Function() fn) async {
    setState(() => _acting = true);
    try {
      await fn();
      ref.invalidate(deliveryDetailProvider(widget.orderId));
      ref.invalidate(deliveriesProvider);
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(extractErrorMessage(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _acting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(deliveryDetailProvider(widget.orderId));
    final warehouseAsync = ref.watch(warehouseProvider);
    final dateFmt = DateFormat('dd/MM/yyyy HH:mm');

    return Scaffold(
      appBar: AppBar(title: const Text('Detalle del envío')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (order) {
          final destLat = order.shippingAddress.latitude;
          final destLng = order.shippingAddress.longitude;
          final hasCoords = destLat != null && destLng != null;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Chip(
                label: Text(statusLabel(order.status)),
                backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
              ),
              if (order.deliveryDeadline != null)
                ListTile(
                  leading: const Icon(Icons.schedule),
                  title: const Text('Fecha límite de entrega'),
                  subtitle: Text(dateFmt.format(order.deliveryDeadline!.toLocal())),
                ),
              const Divider(),
              const Text('Cliente', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ListTile(
                leading: const Icon(Icons.person),
                title: Text(order.customerName),
                subtitle: Text(order.customerPhone),
              ),
              const Divider(),
              const Text('Productos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ...order.items.map(
                (item) => ListTile(
                  leading: item.imageUrl.isNotEmpty
                      ? Image.network(item.imageUrl, width: 48, height: 48, fit: BoxFit.cover)
                      : const Icon(Icons.album),
                  title: Text(item.name),
                  subtitle: Text('${item.artist} · x${item.quantity}'),
                ),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.location_on),
                title: const Text('Dirección de entrega'),
                subtitle: Text(
                  '${order.shippingAddress.street}, ${order.shippingAddress.city}',
                ),
              ),
              const SizedBox(height: 16),
              if (order.status == 'pedido')
                ElevatedButton.icon(
                  onPressed: _acting
                      ? null
                      : () => _action(() async {
                            await ref
                                .read(deliveriesRepositoryProvider)
                                .startDelivery(widget.orderId);
                          }),
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Empezar entrega'),
                ),
              if (order.status == 'recogida') ...[
                warehouseAsync.when(
                  loading: () => const LinearProgressIndicator(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (wh) => ElevatedButton.icon(
                    onPressed: _acting || !hasCoords
                        ? null
                        : () => context.push(
                              '/deliveries/${widget.orderId}/route',
                              extra: RouteMapArgs(
                                title: 'Ruta al almacén',
                                destination: LatLng(wh.latitude, wh.longitude),
                                destinationLabel: wh.name,
                              ),
                            ),
                    icon: const Icon(Icons.map),
                    label: const Text('Ver ruta al almacén'),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: _acting
                      ? null
                      : () => _action(() async {
                            await ref
                                .read(deliveriesRepositoryProvider)
                                .completePickup(widget.orderId);
                          }),
                  icon: const Icon(Icons.inventory_2),
                  label: const Text('Recogida completada'),
                ),
              ],
              if (order.status == 'cargado') ...[
                if (hasCoords)
                  ElevatedButton.icon(
                    onPressed: _acting
                        ? null
                        : () => context.push(
                              '/deliveries/${widget.orderId}/route',
                              extra: RouteMapArgs(
                                title: 'Ruta al cliente',
                                destination: LatLng(destLat, destLng),
                                destinationLabel: order.customerName,
                              ),
                            ),
                    icon: const Icon(Icons.map),
                    label: const Text('Ver ruta al cliente'),
                  ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: _acting
                      ? null
                      : () => context.push('/deliveries/${widget.orderId}/complete'),
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Completar entrega'),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

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
