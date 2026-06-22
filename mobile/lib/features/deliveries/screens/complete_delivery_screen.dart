import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:signature/signature.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../data/deliveries_repository.dart';
import '../providers/deliveries_provider.dart';

class CompleteDeliveryScreen extends ConsumerStatefulWidget {
  const CompleteDeliveryScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<CompleteDeliveryScreen> createState() => _CompleteDeliveryScreenState();
}

class _CompleteDeliveryScreenState extends ConsumerState<CompleteDeliveryScreen> {
  final _picker = ImagePicker();
  final _signatureCtrl = SignatureController(
    penStrokeWidth: 2,
    penColor: AppColors.bg,
    exportBackgroundColor: AppColors.text,
  );
  final List<Uint8List> _photos = [];
  bool _submitting = false;

  @override
  void dispose() {
    _signatureCtrl.dispose();
    super.dispose();
  }

  Future<void> _addPhoto(ImageSource source) async {
    final file = await _picker.pickImage(source: source, imageQuality: 80);
    if (file == null) return;
    final bytes = await file.readAsBytes();
    setState(() => _photos.add(bytes));
  }

  Future<void> _submit() async {
    if (_photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('AGREGA AL MENOS UNA FOTO')),
      );
      return;
    }
    if (_signatureCtrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('EL CLIENTE DEBE FIRMAR')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final signature = await _signatureCtrl.toPngBytes();
      if (signature == null) throw Exception('No se pudo exportar la firma');

      await ref.read(deliveriesRepositoryProvider).completeDelivery(
            id: widget.orderId,
            photos: _photos,
            signature: signature,
          );
      ref.invalidate(deliveriesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('ENTREGA COMPLETADA')),
        );
        context.go('/deliveries');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(extractErrorMessage(e).toUpperCase())),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
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
      body: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        children: [
          const QtbPageHeader(
            label: 'Entrega',
            title: 'Evidencia',
            subtitle: 'Fotos y firma del cliente',
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const QtbLabel('Fotos de evidencia'),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ..._photos.asMap().entries.map(
                          (e) => Stack(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Image.memory(e.value, width: 80, height: 80, fit: BoxFit.cover),
                              ),
                              Positioned(
                                right: 0,
                                top: 0,
                                child: IconButton(
                                  icon: const Icon(Icons.close, size: 16, color: AppColors.text),
                                  onPressed: () => setState(() => _photos.removeAt(e.key)),
                                ),
                              ),
                            ],
                          ),
                        ),
                    OutlinedButton.icon(
                      onPressed: () => _addPhoto(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt_outlined, size: 18),
                      label: const Text('CÁMARA'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => _addPhoto(ImageSource.gallery),
                      icon: const Icon(Icons.photo_outlined, size: 18),
                      label: const Text('GALERÍA'),
                    ),
                  ],
                ),
                const SizedBox(height: 28),
                const QtbLabel('Firma del cliente'),
                const SizedBox(height: 12),
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.borderStrong),
                    color: AppColors.text,
                  ),
                  child: ClipRect(
                    child: Signature(
                      controller: _signatureCtrl,
                      backgroundColor: AppColors.text,
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: QtbGhostButton(
                    label: 'Limpiar firma',
                    onPressed: () => _signatureCtrl.clear(),
                  ),
                ),
                const SizedBox(height: 24),
                QtbPrimaryButton(
                  label: 'Confirmar entrega',
                  loading: _submitting,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
