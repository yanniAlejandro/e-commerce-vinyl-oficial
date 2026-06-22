import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/qtb_widgets.dart';
import '../data/deliveries_repository.dart';
import '../providers/deliveries_provider.dart';

class DeliveriesInboxScreen extends ConsumerStatefulWidget {
  const DeliveriesInboxScreen({super.key});

  @override
  ConsumerState<DeliveriesInboxScreen> createState() => _DeliveriesInboxScreenState();
}

class _DeliveriesInboxScreenState extends ConsumerState<DeliveriesInboxScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(deliveriesRepositoryProvider).markInboxViewed();
      ref.invalidate(inboxBadgeProvider);
    });
  }

  @override
  Widget build(BuildContext context) {
    final deliveriesAsync = ref.watch(deliveriesProvider);
    final badgeAsync = ref.watch(inboxBadgeProvider);
    final dateFmt = DateFormat('dd/MM HH:mm');
    final newCount = badgeAsync.valueOrNull?.newCount ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const QtbLogo(size: 18),
        actions: [
          if (newCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.accentRed),
                  ),
                  child: Text(
                    '$newCount NUEVOS',
                    style: AppTypography.mono(size: 9, color: AppColors.accentRed, letterSpacing: 1.2),
                  ),
                ),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: deliveriesAsync.when(
        loading: () => const QtbSpinner(label: 'Cargando envíos'),
        error: (e, _) => QtbEmptyState(title: 'Error', subtitle: e.toString()),
        data: (deliveries) {
          if (deliveries.isEmpty) {
            return const QtbEmptyState(
              title: 'Sin envíos',
              subtitle: 'Cuando te asignen pedidos aparecerán aquí ordenados por fecha límite.',
            );
          }
          return RefreshIndicator(
            color: AppColors.text,
            backgroundColor: AppColors.surface,
            onRefresh: () async {
              ref.invalidate(deliveriesProvider);
              ref.invalidate(inboxBadgeProvider);
            },
            child: ListView(
              children: [
                QtbPageHeader(
                  label: 'Mensajero',
                  title: 'Mis envíos',
                  subtitle: '${deliveries.length} asignados',
                ),
                ...deliveries.map((d) {
                  return QtbListTile(
                    title: d.customerName,
                    badge: QtbStatusBadge(status: d.status),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${d.items.length} vinilo(s)',
                          style: AppTypography.mono(size: 11, color: AppColors.textMuted),
                        ),
                        if (d.deliveryDeadline != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'LÍMITE ${dateFmt.format(d.deliveryDeadline!.toLocal())}',
                            style: AppTypography.mono(size: 10, color: AppColors.statusGold),
                          ),
                        ],
                      ],
                    ),
                    onTap: () => context.push('/deliveries/${d.id}'),
                  );
                }),
              ],
            ),
          );
        },
      ),
    );
  }
}
