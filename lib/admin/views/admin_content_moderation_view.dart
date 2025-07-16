import 'package:flutter/material.dart';

class AdminContentModerationView extends StatelessWidget {
  const AdminContentModerationView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Content Moderation'),
      ),
      body: const Center(
        child: Text('Content Moderation View'),
      ),
    );
  }
}
