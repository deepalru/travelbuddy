import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:travel_buddy/widgets/header.dart';

void main() {
  testWidgets('Header displays title', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        appBar: PreferredSize(
          preferredSize: Size.fromHeight(80.0),
          child: Header(),
        ),
      ),
    ));

    expect(find.text('Travel Buddy'), findsOneWidget);
  });
}
