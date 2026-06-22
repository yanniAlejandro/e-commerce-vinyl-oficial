import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../data/deliveries_repository.dart';
import '../models/delivery_order.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Mis envíos'),
            if (badgeAsync.valueOrNull?.hasNew == true) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${badgeAsync.value!.newCount}',
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
            ],
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: deliveriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (deliveries) {
          if (deliveries.isEmpty) {
            return const Center(child: Text('No tienes envíos asignados'));
          }
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(deliveriesProvider);
              ref.invalidate(inboxBadgeProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: deliveries.length,
              itemBuilder: (context, index) {
                final d = deliveries[index];
                return Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    title: Text(d.customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text('${d.items.length} vinilo(s) · ${statusLabel(d.status)}'),
                        if (d.deliveryDeadline != null)
                          Text(
                            'Límite: ${dateFmt.format(d.deliveryDeadline!.toLocal())}',
                            style: TextStyle(color: Colors.orange[800]),
                          ),
                      ],
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/deliveries/${d.id}'),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
