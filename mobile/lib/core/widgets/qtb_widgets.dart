import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class QtbLogo extends StatelessWidget {
  const QtbLogo({super.key, this.size = 22});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Text(
      'qtb',
      style: AppTypography.logo().copyWith(fontSize: size),
    );
  }
}

class QtbLabel extends StatelessWidget {
  const QtbLabel(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text.toUpperCase(), style: AppTypography.label());
  }
}

class QtbPageHeader extends StatelessWidget {
  const QtbPageHeader({
    super.key,
    required this.label,
    required this.title,
    this.subtitle,
  });

  final String label;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          QtbLabel(label),
          const SizedBox(height: 12),
          Text(title.toUpperCase(), style: AppTypography.displayTitle(context, size: 32)),
          if (subtitle != null) ...[
            const SizedBox(height: 10),
            Text(subtitle!.toUpperCase(), style: AppTypography.label()),
          ],
        ],
      ),
    );
  }
}

class QtbErrorBanner extends StatelessWidget {
  const QtbErrorBanner(this.message, {super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.dangerBg,
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.35)),
      ),
      child: Text(message, style: AppTypography.mono(size: 12, color: AppColors.danger)),
    );
  }
}

class QtbPrimaryButton extends StatelessWidget {
  const QtbPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: loading ? null : onPressed,
        child: loading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.bg),
              )
            : Text(label.toUpperCase()),
      ),
    );
  }
}

class QtbOutlineButton extends StatelessWidget {
  const QtbOutlineButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: loading ? null : onPressed,
        icon: loading
            ? const SizedBox(
                height: 18,
                width: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(icon ?? Icons.arrow_forward, size: 18),
        label: Text(label.toUpperCase()),
      ),
    );
  }
}

class QtbGhostButton extends StatelessWidget {
  const QtbGhostButton({super.key, required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Text(label.toUpperCase(), style: AppTypography.mono(size: 11)),
    );
  }
}

class QtbTextField extends StatelessWidget {
  const QtbTextField({
    super.key,
    required this.label,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.maxLength,
    this.textAlign,
    this.style,
  });

  final String label;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final int? maxLength;
  final TextAlign? textAlign;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        QtbLabel(label),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          maxLength: maxLength,
          textAlign: textAlign ?? TextAlign.start,
          style: style ?? AppTypography.body(),
          decoration: const InputDecoration(counterText: ''),
        ),
      ],
    );
  }
}

class QtbStatusBadge extends StatelessWidget {
  const QtbStatusBadge({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final (color, label) = _statusStyle(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        border: Border.all(color: color.withValues(alpha: 0.8)),
      ),
      child: Text(
        label.toUpperCase(),
        style: AppTypography.mono(size: 10, color: color, letterSpacing: 1.4),
      ),
    );
  }

  (Color, String) _statusStyle(String status) {
    switch (status) {
      case 'pedido':
        return (AppColors.text, 'Asignado');
      case 'recogida':
        return (AppColors.statusGold, 'En recogida');
      case 'cargado':
        return (AppColors.statusGold, 'En reparto');
      case 'entregado':
        return (AppColors.statusGreen, 'Entregado');
      case 'cancelado':
        return (AppColors.danger, 'Cancelado');
      default:
        return (AppColors.textMuted, status);
    }
  }
}

class QtbSpinner extends StatelessWidget {
  const QtbSpinner({super.key, this.label = 'Cargando'});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 32,
            height: 32,
            child: CircularProgressIndicator(strokeWidth: 1),
          ),
          const SizedBox(height: 16),
          Text(label.toUpperCase(), style: AppTypography.label()),
        ],
      ),
    );
  }
}

class QtbEmptyState extends StatelessWidget {
  const QtbEmptyState({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(title, style: AppTypography.serifTitle(context, size: 28), textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: 12),
              Text(subtitle!, style: AppTypography.body(color: AppColors.textMuted), textAlign: TextAlign.center),
            ],
          ],
        ),
      ),
    );
  }
}

class QtbListTile extends StatelessWidget {
  const QtbListTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.trailing,
    this.badge,
  });

  final String title;
  final Widget subtitle;
  final VoidCallback onTap;
  final Widget? trailing;
  final Widget? badge;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(title, style: AppTypography.body(size: 16, color: AppColors.text)),
                        ),
                        if (badge != null) badge!,
                      ],
                    ),
                    const SizedBox(height: 8),
                    subtitle,
                  ],
                ),
              ),
              trailing ?? const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}

class QtbAuthShell extends StatelessWidget {
  const QtbAuthShell({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Center(child: QtbLogo(size: 28)),
                  const SizedBox(height: 48),
                  Container(
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: AppColors.borderStrong)),
                    ),
                    padding: const EdgeInsets.only(top: 32),
                    child: child,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
