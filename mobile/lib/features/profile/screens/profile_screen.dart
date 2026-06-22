import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _currentPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  bool _savingName = false;
  bool _savingPass = false;
  String? _error;
  bool _initialized = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _currentPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _saveName() async {
    setState(() {
      _savingName = true;
      _error = null;
    });
    try {
      await ref.read(authRepositoryProvider).updateProfile(_nameCtrl.text.trim());
      await ref.read(authStateProvider.notifier).refreshProfile();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('NOMBRE ACTUALIZADO')),
        );
      }
    } on DioException catch (e) {
      setState(() => _error = extractErrorMessage(e));
    } finally {
      if (mounted) setState(() => _savingName = false);
    }
  }

  Future<void> _changePassword() async {
    if (_newPassCtrl.text != _confirmPassCtrl.text) {
      setState(() => _error = 'Las contraseñas nuevas no coinciden');
      return;
    }
    setState(() {
      _savingPass = true;
      _error = null;
    });
    try {
      await ref.read(authRepositoryProvider).changePassword(
            currentPassword: _currentPassCtrl.text,
            newPassword: _newPassCtrl.text,
            newPasswordConfirm: _confirmPassCtrl.text,
          );
      _currentPassCtrl.clear();
      _newPassCtrl.clear();
      _confirmPassCtrl.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('CONTRASEÑA ACTUALIZADA')),
        );
      }
    } on DioException catch (e) {
      setState(() => _error = extractErrorMessage(e));
    } finally {
      if (mounted) setState(() => _savingPass = false);
    }
  }

  Future<void> _logout() async {
    await ref.read(authStateProvider.notifier).logout();
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).value;
    if (!_initialized && user != null) {
      _nameCtrl.text = user.fullName;
      _initialized = true;
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const QtbLogo(size: 18),
      ),
      body: ListView(
        children: [
          const QtbPageHeader(
            label: 'Cuenta',
            title: 'Mi perfil',
          ),
          if (user != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user.fullName, style: AppTypography.body(size: 18)),
                  const SizedBox(height: 4),
                  Text(
                    '@${user.username ?? ''} · ${user.email}',
                    style: AppTypography.mono(size: 11, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const QtbLabel('Editar nombre'),
                const SizedBox(height: 12),
                QtbTextField(label: 'Nombre completo', controller: _nameCtrl),
                const SizedBox(height: 12),
                QtbPrimaryButton(
                  label: 'Guardar nombre',
                  loading: _savingName,
                  onPressed: _saveName,
                ),
                const SizedBox(height: 32),
                Container(height: 1, color: AppColors.border),
                const SizedBox(height: 32),
                const QtbLabel('Cambiar contraseña'),
                const SizedBox(height: 12),
                QtbTextField(
                  label: 'Contraseña actual',
                  controller: _currentPassCtrl,
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                QtbTextField(
                  label: 'Nueva contraseña',
                  controller: _newPassCtrl,
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                QtbTextField(
                  label: 'Confirmar nueva contraseña',
                  controller: _confirmPassCtrl,
                  obscureText: true,
                ),
                const SizedBox(height: 12),
                QtbPrimaryButton(
                  label: 'Actualizar contraseña',
                  loading: _savingPass,
                  onPressed: _changePassword,
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  QtbErrorBanner(_error!),
                ],
                const SizedBox(height: 32),
                QtbOutlineButton(
                  label: 'Cerrar sesión',
                  icon: Icons.logout,
                  onPressed: _logout,
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
