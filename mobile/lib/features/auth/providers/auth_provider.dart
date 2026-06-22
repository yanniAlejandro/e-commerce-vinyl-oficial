import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/auth_repository.dart';
import '../models/courier_user.dart';

final authStateProvider = AsyncNotifierProvider<AuthNotifier, CourierUser?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<CourierUser?> {
  @override
  Future<CourierUser?> build() async {
    final session = await ref.read(authRepositoryProvider).restoreSession();
    return session?.user;
  }

  Future<void> login(String login, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref.read(authRepositoryProvider).login(
            login: login,
            password: password,
          );
      return session.user;
    });
    if (state.hasError) throw state.error!;
  }

  Future<void> completeOtp(String email, String code) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await ref.read(authRepositoryProvider).verifyOtp(
            email: email,
            code: code,
          );
      return session.user;
    });
    if (state.hasError) throw state.error!;
  }

  Future<void> refreshProfile() async {
    final user = await ref.read(authRepositoryProvider).getProfile();
    state = AsyncData(user);
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(null);
  }
}
