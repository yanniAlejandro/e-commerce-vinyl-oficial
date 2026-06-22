import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _loginCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _loginCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authStateProvider.notifier).login(
            _loginCtrl.text.trim(),
            _passwordCtrl.text,
          );
      if (mounted) context.go('/deliveries');
    } on DioException catch (e) {
      setState(() => _error = extractErrorMessage(e));
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return QtbAuthShell(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Acceso', style: AppTypography.serifTitle(context)),
            const SizedBox(height: 8),
            Text(
              'Mensajeros · La Habana',
              style: AppTypography.mono(size: 11, color: AppColors.textMuted, letterSpacing: 0.8),
            ),
            const SizedBox(height: 28),
            if (_error != null) ...[
              QtbErrorBanner(_error!),
              const SizedBox(height: 20),
            ],
            QtbTextField(
              label: 'Usuario o email',
              controller: _loginCtrl,
              validator: (v) =>
                  v == null || v.trim().length < 3 ? 'Ingresa tu usuario o email' : null,
            ),
            const SizedBox(height: 20),
            QtbTextField(
              label: 'Contraseña',
              controller: _passwordCtrl,
              obscureText: true,
              validator: (v) => v == null || v.length < 8 ? 'Mínimo 8 caracteres' : null,
            ),
            const SizedBox(height: 28),
            QtbPrimaryButton(
              label: 'Entrar',
              loading: _loading,
              onPressed: _submit,
            ),
            const SizedBox(height: 20),
            Center(
              child: QtbGhostButton(
                label: '¿Nuevo mensajero? Regístrate',
                onPressed: () => context.push('/register'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
