import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:qtb_messenger/app.dart';

void main() {
  testWidgets('App loads login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: QtbMessengerApp()));
    await tester.pumpAndSettle();
    expect(find.text('QTB Mensajeros'), findsOneWidget);
  });
}
