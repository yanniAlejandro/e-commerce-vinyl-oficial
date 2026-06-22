import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../data/auth_repository.dart';
import '../providers/auth_provider.dart';

class OtpVerifyScreen extends ConsumerStatefulWidget {
  const OtpVerifyScreen({super.key, required this.email});

  final String email;

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  final _codeCtrl = TextEditingController();
  Timer? _timer;
  int _secondsLeft = 60;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsLeft = 60);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft <= 1) {
        t.cancel();
        setState(() => _secondsLeft = 0);
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _codeCtrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (_codeCtrl.text.length < 4) {
      setState(() => _error = 'Ingresa el código completo');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authStateProvider.notifier).completeOtp(widget.email, _codeCtrl.text.trim());
      if (mounted) context.go('/deliveries');
    } on DioException catch (e) {
      setState(() => _error = extractErrorMessage(e));
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    if (_secondsLeft > 0) return;
    setState(() => _error = null);
    try {
      await ref.read(authRepositoryProvider).resendOtp(widget.email);
      _startTimer();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('CÓDIGO REENVIADO')),
        );
      }
    } on DioException catch (e) {
      setState(() => _error = extractErrorMessage(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    return QtbAuthShell(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Verificar email', style: AppTypography.serifTitle(context, size: 36)),
          const SizedBox(height: 12),
          Text(
            'Código enviado a\n${widget.email}',
            textAlign: TextAlign.center,
            style: AppTypography.body(color: AppColors.textMuted),
          ),
          const SizedBox(height: 32),
          QtbTextField(
            label: 'Código OTP',
            controller: _codeCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: AppTypography.mono(size: 28, letterSpacing: 8),
          ),
          if (_error != null) ...[
            const SizedBox(height: 16),
            QtbErrorBanner(_error!),
          ],
          const SizedBox(height: 28),
          QtbPrimaryButton(label: 'Verificar', loading: _loading, onPressed: _verify),
          const SizedBox(height: 12),
          Center(
            child: TextButton(
              onPressed: _secondsLeft > 0 ? null : _resend,
              child: Text(
                _secondsLeft > 0
                    ? 'REENVIAR CÓDIGO (${_secondsLeft}S)'
                    : 'REENVIAR CÓDIGO',
                style: AppTypography.mono(
                  size: 11,
                  color: _secondsLeft > 0 ? AppColors.textMuted.withValues(alpha: 0.4) : AppColors.textMuted,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
