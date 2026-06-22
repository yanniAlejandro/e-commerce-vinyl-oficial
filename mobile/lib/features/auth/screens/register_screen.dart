import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../data/auth_repository.dart';
import '../models/courier_user.dart';

const _vehicleTypes = {
  'bicycle': 'Bicicleta',
  'motorcycle': 'Motocicleta',
  'car': 'Automóvil',
  'van': 'Furgoneta',
};

const _weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  String _vehicleType = 'motorcycle';
  final Set<int> _selectedDays = {0, 1, 2, 3, 4};
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 18, minute: 0);
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _emailCtrl.dispose();
    _nameCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  String _formatTime(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDays.isEmpty) {
      setState(() => _error = 'Selecciona al menos un día disponible');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final availability = _selectedDays
          .map(
            (d) => AvailabilitySlot(
              dayOfWeek: d,
              startTime: _formatTime(_startTime),
              endTime: _formatTime(_endTime),
            ),
          )
          .toList();
      await ref.read(authRepositoryProvider).register(
            username: _usernameCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
            passwordConfirm: _confirmCtrl.text,
            fullName: _nameCtrl.text.trim(),
            vehicleType: _vehicleType,
            availability: availability,
          );
      if (mounted) {
        context.push('/verify-otp', extra: _emailCtrl.text.trim());
      }
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
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const QtbLogo(size: 18),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const QtbPageHeader(
                  label: 'Mensajeros',
                  title: 'Registro',
                  subtitle: 'Únete a la red de reparto QTB',
                ),
                if (_error != null) ...[
                  QtbErrorBanner(_error!),
                  const SizedBox(height: 20),
                ],
                QtbTextField(
                  label: 'Nombre de usuario',
                  controller: _usernameCtrl,
                  validator: (v) => v == null || v.length < 3 ? 'Mínimo 3 caracteres' : null,
                ),
                const SizedBox(height: 16),
                QtbTextField(
                  label: 'Nombre completo',
                  controller: _nameCtrl,
                  validator: (v) => v == null || v.length < 2 ? 'Ingresa tu nombre' : null,
                ),
                const SizedBox(height: 16),
                QtbTextField(
                  label: 'Email',
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v == null || !v.contains('@') ? 'Email inválido' : null,
                ),
                const SizedBox(height: 16),
                QtbTextField(
                  label: 'Contraseña',
                  controller: _passwordCtrl,
                  obscureText: true,
                  validator: (v) => v == null || v.length < 8 ? 'Mínimo 8 caracteres' : null,
                ),
                const SizedBox(height: 16),
                QtbTextField(
                  label: 'Repetir contraseña',
                  controller: _confirmCtrl,
                  obscureText: true,
                  validator: (v) =>
                      v != _passwordCtrl.text ? 'Las contraseñas no coinciden' : null,
                ),
                const SizedBox(height: 24),
                const QtbLabel('Tipo de vehículo'),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _vehicleType,
                  dropdownColor: AppColors.surface,
                  items: _vehicleTypes.entries
                      .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                      .toList(),
                  onChanged: (v) => setState(() => _vehicleType = v!),
                  decoration: const InputDecoration(),
                ),
                const SizedBox(height: 24),
                const QtbLabel('Disponibilidad'),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: List.generate(7, (i) {
                    final selected = _selectedDays.contains(i);
                    return FilterChip(
                      label: Text(_weekDays[i]),
                      selected: selected,
                      onSelected: (v) => setState(() {
                        if (v) {
                          _selectedDays.add(i);
                        } else {
                          _selectedDays.remove(i);
                        }
                      }),
                    );
                  }),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () async {
                          final t = await showTimePicker(context: context, initialTime: _startTime);
                          if (t != null) setState(() => _startTime = t);
                        },
                        child: Text('DESDE ${_formatTime(_startTime)}'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () async {
                          final t = await showTimePicker(context: context, initialTime: _endTime);
                          if (t != null) setState(() => _endTime = t);
                        },
                        child: Text('HASTA ${_formatTime(_endTime)}'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                QtbPrimaryButton(
                  label: 'Enviar solicitud',
                  loading: _loading,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
