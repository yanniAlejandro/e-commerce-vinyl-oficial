import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/token_storage.dart';
import '../models/courier_user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    dio: ref.watch(dioProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

class AuthRepository {
  AuthRepository({required Dio dio, required TokenStorage tokenStorage})
      : _dio = dio,
        _tokenStorage = tokenStorage;

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<void> register({
    required String username,
    required String email,
    required String password,
    required String passwordConfirm,
    required String fullName,
    required String vehicleType,
    required List<AvailabilitySlot> availability,
  }) async {
    await _dio.post('/courier/auth/register', data: {
      'username': username,
      'email': email,
      'password': password,
      'password_confirm': passwordConfirm,
      'full_name': fullName,
      'vehicle_type': vehicleType,
      'availability': availability.map((a) => a.toJson()).toList(),
    });
  }

  Future<AuthSession> verifyOtp({required String email, required String code}) async {
    final response = await _dio.post('/courier/auth/verify-otp', data: {
      'email': email,
      'code': code,
    });
    return _sessionFromResponse(response.data as Map<String, dynamic>);
  }

  Future<void> resendOtp(String email) async {
    await _dio.post('/courier/auth/resend-otp', data: {'email': email});
  }

  Future<AuthSession> login({required String login, required String password}) async {
    final response = await _dio.post('/courier/auth/login', data: {
      'login': login,
      'password': password,
    });
    return _sessionFromResponse(response.data as Map<String, dynamic>);
  }

  Future<CourierUser> getProfile() async {
    final response = await _dio.get('/courier/auth/me');
    return CourierUser.fromJson(response.data as Map<String, dynamic>);
  }

  Future<CourierUser> updateProfile(String fullName) async {
    final response = await _dio.patch('/courier/auth/profile', data: {
      'full_name': fullName,
    });
    return CourierUser.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirm,
  }) async {
    await _dio.post('/courier/auth/change-password', data: {
      'current_password': currentPassword,
      'new_password': newPassword,
      'new_password_confirm': newPasswordConfirm,
    });
  }

  Future<AuthSession?> restoreSession() async {
    final token = await _tokenStorage.readToken();
    if (token == null) return null;
    try {
      final user = await getProfile();
      return AuthSession(token: token, user: user);
    } catch (_) {
      await _tokenStorage.clear();
      return null;
    }
  }

  Future<void> logout() => _tokenStorage.clear();

  Future<AuthSession> _sessionFromResponse(Map<String, dynamic> data) async {
    final token = data['access_token'] as String;
    final user = CourierUser.fromJson(data['user'] as Map<String, dynamic>);
    await _tokenStorage.saveToken(token);
    return AuthSession(token: token, user: user);
  }
}
