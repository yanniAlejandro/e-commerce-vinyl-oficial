import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../data/deliveries_repository.dart';
import '../models/delivery_order.dart';
import '../models/route_map_args.dart';
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
          SnackBar(content: Text(extractErrorMessage(e).toUpperCase())),
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
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const QtbLogo(size: 18),
      ),
      body: orderAsync.when(
        loading: () => const QtbSpinner(),
        error: (e, _) => QtbEmptyState(title: 'Error', subtitle: '$e'),
        data: (order) {
          final destLat = order.shippingAddress.latitude;
          final destLng = order.shippingAddress.longitude;
          final hasCoords = destLat != null && destLng != null;

          return ListView(
            padding: const EdgeInsets.only(bottom: 32),
            children: [
              QtbPageHeader(
                label: 'Envío #${order.id.substring(order.id.length - 8).toUpperCase()}',
                title: order.customerName,
                subtitle: statusLabel(order.status),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: QtbStatusBadge(status: order.status),
              ),
              if (order.deliveryDeadline != null)
                _section(
                  'Fecha límite',
                  Text(
                    dateFmt.format(order.deliveryDeadline!.toLocal()).toUpperCase(),
                    style: AppTypography.mono(size: 12, color: AppColors.statusGold),
                  ),
                ),
              _section(
                'Cliente',
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order.customerName, style: AppTypography.body(size: 16)),
                    if (order.customerPhone.isNotEmpty)
                      Text(
                        order.customerPhone,
                        style: AppTypography.mono(size: 12, color: AppColors.textMuted),
                      ),
                  ],
                ),
              ),
              _section(
                'Productos',
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: order.items.map((item) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (item.imageUrl.isNotEmpty)
                            Image.network(
                              item.imageUrl,
                              width: 48,
                              height: 48,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => _vinylPlaceholder(),
                            )
                          else
                            _vinylPlaceholder(),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.name, style: AppTypography.body(size: 15)),
                                Text(
                                  '${item.artist} · ×${item.quantity}',
                                  style: AppTypography.mono(size: 11, color: AppColors.textMuted),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              _section(
                'Dirección',
                Text(
                  '${order.shippingAddress.street}, ${order.shippingAddress.city}',
                  style: AppTypography.body(color: AppColors.textMuted),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (order.status == 'pedido')
                      QtbPrimaryButton(
                        label: 'Empezar entrega',
                        loading: _acting,
                        onPressed: () => _action(() async {
                          await ref
                              .read(deliveriesRepositoryProvider)
                              .startDelivery(widget.orderId);
                        }),
                      ),
                    if (order.status == 'recogida') ...[
                      warehouseAsync.when(
                        loading: () => const LinearProgressIndicator(minHeight: 1),
                        error: (_, __) => const SizedBox.shrink(),
                        data: (wh) => QtbOutlineButton(
                          label: 'Ruta al almacén',
                          icon: Icons.map_outlined,
                          loading: _acting,
                          onPressed: !hasCoords
                              ? null
                              : () => context.push(
                                    '/deliveries/${widget.orderId}/route',
                                    extra: RouteMapArgs(
                                      title: 'Ruta al almacén',
                                      destination: LatLng(wh.latitude, wh.longitude),
                                      destinationLabel: wh.name,
                                    ),
                                  ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      QtbPrimaryButton(
                        label: 'Recogida completada',
                        loading: _acting,
                        onPressed: () => _action(() async {
                          await ref
                              .read(deliveriesRepositoryProvider)
                              .completePickup(widget.orderId);
                        }),
                      ),
                    ],
                    if (order.status == 'cargado') ...[
                      if (hasCoords)
                        QtbOutlineButton(
                          label: 'Ruta al cliente',
                          icon: Icons.map_outlined,
                          onPressed: () => context.push(
                            '/deliveries/${widget.orderId}/route',
                            extra: RouteMapArgs(
                              title: 'Ruta al cliente',
                              destination: LatLng(destLat, destLng),
                              destinationLabel: order.customerName,
                            ),
                          ),
                        ),
                      const SizedBox(height: 12),
                      QtbPrimaryButton(
                        label: 'Completar entrega',
                        onPressed: () => context.push('/deliveries/${widget.orderId}/complete'),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _vinylPlaceholder() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        color: AppColors.surface,
      ),
      child: const Icon(Icons.album_outlined, color: AppColors.textMuted, size: 22),
    );
  }

  Widget _section(String label, Widget child) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          QtbLabel(label),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
