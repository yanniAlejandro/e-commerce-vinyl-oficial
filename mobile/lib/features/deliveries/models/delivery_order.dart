class DeliveryOrder {
  const DeliveryOrder({
    required this.id,
    required this.status,
    required this.items,
    required this.customerName,
    required this.customerPhone,
    required this.shippingAddress,
    this.deliveryDeadline,
    this.assignedAt,
    this.total = 0,
  });

  final String id;
  final String status;
  final List<DeliveryItem> items;
  final String customerName;
  final String customerPhone;
  final ShippingAddress shippingAddress;
  final DateTime? deliveryDeadline;
  final DateTime? assignedAt;
  final double total;

  factory DeliveryOrder.fromJson(Map<String, dynamic> json) => DeliveryOrder(
        id: json['id'] as String,
        status: json['status'] as String,
        items: (json['items'] as List<dynamic>)
            .map((e) => DeliveryItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        customerName: json['customer_name'] as String,
        customerPhone: json['customer_phone'] as String? ?? '',
        shippingAddress:
            ShippingAddress.fromJson(json['shipping_address'] as Map<String, dynamic>),
        deliveryDeadline: json['delivery_deadline'] != null
            ? DateTime.parse(json['delivery_deadline'] as String)
            : null,
        assignedAt: json['assigned_at'] != null
            ? DateTime.parse(json['assigned_at'] as String)
            : null,
        total: (json['total'] as num?)?.toDouble() ?? 0,
      );
}

class DeliveryItem {
  const DeliveryItem({
    required this.name,
    required this.artist,
    required this.quantity,
    this.imageUrl = '',
  });

  final String name;
  final String artist;
  final int quantity;
  final String imageUrl;

  factory DeliveryItem.fromJson(Map<String, dynamic> json) => DeliveryItem(
        name: json['name'] as String,
        artist: json['artist'] as String,
        quantity: json['quantity'] as int,
        imageUrl: json['image_url'] as String? ?? '',
      );
}

class ShippingAddress {
  const ShippingAddress({
    required this.fullName,
    required this.street,
    required this.city,
    required this.phone,
    this.latitude,
    this.longitude,
  });

  final String fullName;
  final String street;
  final String city;
  final String phone;
  final double? latitude;
  final double? longitude;

  factory ShippingAddress.fromJson(Map<String, dynamic> json) => ShippingAddress(
        fullName: json['full_name'] as String,
        street: json['street'] as String,
        city: json['city'] as String,
        phone: json['phone'] as String? ?? '',
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
      );
}

class WarehouseLocation {
  const WarehouseLocation({
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
  });

  final String name;
  final String address;
  final double latitude;
  final double longitude;

  factory WarehouseLocation.fromJson(Map<String, dynamic> json) => WarehouseLocation(
        name: json['warehouse_name'] as String,
        address: json['warehouse_address'] as String,
        latitude: (json['warehouse_latitude'] as num).toDouble(),
        longitude: (json['warehouse_longitude'] as num).toDouble(),
      );
}

class InboxBadge {
  const InboxBadge({required this.hasNew, required this.newCount});

  final bool hasNew;
  final int newCount;

  factory InboxBadge.fromJson(Map<String, dynamic> json) => InboxBadge(
        hasNew: json['has_new'] as bool,
        newCount: json['new_count'] as int,
      );
}

String statusLabel(String status) {
  switch (status) {
    case 'pedido':
      return 'Asignado';
    case 'recogida':
      return 'En recogida';
    case 'cargado':
      return 'En reparto';
    case 'entregado':
      return 'Entregado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
}
