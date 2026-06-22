class AvailabilitySlot {
  const AvailabilitySlot({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
  });

  final int dayOfWeek;
  final String startTime;
  final String endTime;

  Map<String, dynamic> toJson() => {
        'day_of_week': dayOfWeek,
        'start_time': startTime,
        'end_time': endTime,
      };

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) => AvailabilitySlot(
        dayOfWeek: json['day_of_week'] as int,
        startTime: json['start_time'] as String,
        endTime: json['end_time'] as String,
      );
}

class CourierUser {
  const CourierUser({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.username,
    this.vehicleType,
    this.availability = const [],
  });

  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? username;
  final String? vehicleType;
  final List<AvailabilitySlot> availability;

  factory CourierUser.fromJson(Map<String, dynamic> json) => CourierUser(
        id: json['id'] as String,
        email: json['email'] as String,
        fullName: json['full_name'] as String,
        role: json['role'] as String,
        username: json['username'] as String?,
        vehicleType: json['vehicle_type'] as String?,
        availability: (json['availability'] as List<dynamic>? ?? [])
            .map((e) => AvailabilitySlot.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

class AuthSession {
  const AuthSession({required this.token, required this.user});

  final String token;
  final CourierUser user;
}
