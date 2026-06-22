import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/deliveries_repository.dart';
import '../models/delivery_order.dart';

final deliveriesProvider = FutureProvider.autoDispose<List<DeliveryOrder>>((ref) async {
  return ref.watch(deliveriesRepositoryProvider).listDeliveries();
});

final deliveryDetailProvider =
    FutureProvider.autoDispose.family<DeliveryOrder, String>((ref, id) async {
  return ref.watch(deliveriesRepositoryProvider).getDelivery(id);
});

final inboxBadgeProvider = FutureProvider.autoDispose<InboxBadge>((ref) async {
  return ref.watch(deliveriesRepositoryProvider).getInboxBadge();
});

final warehouseProvider = FutureProvider.autoDispose<WarehouseLocation>((ref) async {
  return ref.watch(deliveriesRepositoryProvider).getWarehouse();
});
