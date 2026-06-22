import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/providers/auth_provider.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/otp_verify_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/deliveries/models/route_map_args.dart';
import '../features/deliveries/screens/complete_delivery_screen.dart';
import '../features/deliveries/screens/deliveries_inbox_screen.dart';
import '../features/deliveries/screens/delivery_detail_screen.dart';
import '../features/deliveries/screens/route_map_screen.dart';
import '../features/profile/screens/profile_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      if (authState.isLoading) return null;

      final loggingIn = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation.startsWith('/verify-otp');
      final isAuthed = authState.valueOrNull != null;

      if (!isAuthed && !loggingIn) return '/login';
      if (isAuthed && loggingIn) return '/deliveries';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(
        path: '/verify-otp',
        builder: (_, state) => OtpVerifyScreen(email: state.extra as String? ?? ''),
      ),
      GoRoute(path: '/deliveries', builder: (_, __) => const DeliveriesInboxScreen()),
      GoRoute(
        path: '/deliveries/:id',
        builder: (_, state) => DeliveryDetailScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/deliveries/:id/route',
        builder: (_, state) => RouteMapScreen(args: state.extra as RouteMapArgs),
      ),
      GoRoute(
        path: '/deliveries/:id/complete',
        builder: (_, state) => CompleteDeliveryScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    ],
  );
});
