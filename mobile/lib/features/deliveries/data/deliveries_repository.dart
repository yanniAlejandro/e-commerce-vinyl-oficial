import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../models/delivery_order.dart';

final deliveriesRepositoryProvider = Provider<DeliveriesRepository>((ref) {
  return DeliveriesRepository(dio: ref.watch(dioProvider));
});

class DeliveriesRepository {
  DeliveriesRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<List<DeliveryOrder>> listDeliveries() async {
    final response = await _dio.get('/courier/deliveries');
    return (response.data as List<dynamic>)
        .map((e) => DeliveryOrder.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<DeliveryOrder> getDelivery(String id) async {
    final response = await _dio.get('/courier/deliveries/$id');
    return DeliveryOrder.fromJson(response.data as Map<String, dynamic>);
  }

  Future<InboxBadge> getInboxBadge() async {
    final response = await _dio.get('/courier/deliveries/inbox/badge');
    return InboxBadge.fromJson(response.data as Map<String, dynamic>);
  }

  Future<InboxBadge> markInboxViewed() async {
    final response = await _dio.post('/courier/deliveries/inbox/viewed');
    return InboxBadge.fromJson(response.data as Map<String, dynamic>);
  }

  Future<DeliveryOrder> startDelivery(String id) async {
    final response = await _dio.post('/courier/deliveries/$id/start');
    return DeliveryOrder.fromJson(response.data as Map<String, dynamic>);
  }

  Future<DeliveryOrder> completePickup(String id) async {
    final response = await _dio.post('/courier/deliveries/$id/complete-pickup');
    return DeliveryOrder.fromJson(response.data as Map<String, dynamic>);
  }

  Future<DeliveryOrder> completeDelivery({
    required String id,
    required List<Uint8List> photos,
    required Uint8List signature,
  }) async {
    final formData = FormData();
    for (var i = 0; i < photos.length; i++) {
      formData.files.add(MapEntry(
        'photos',
        MultipartFile.fromBytes(photos[i], filename: 'photo_$i.jpg'),
      ));
    }
    formData.files.add(MapEntry(
      'signature',
      MultipartFile.fromBytes(signature, filename: 'signature.png'),
    ));

    final response = await _dio.post(
      '/courier/deliveries/$id/complete-delivery',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return DeliveryOrder.fromJson(response.data as Map<String, dynamic>);
  }

  Future<WarehouseLocation> getWarehouse() async {
    final response = await _dio.get('/courier/warehouse');
    return WarehouseLocation.fromJson(response.data as Map<String, dynamic>);
  }
}
