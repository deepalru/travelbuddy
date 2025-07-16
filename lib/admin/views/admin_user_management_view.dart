import 'package:flutter/material.dart';

class AdminUserManagementView extends StatelessWidget {
  const AdminUserManagementView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
      ),
      body: const Center(
        child: Text('User Management View'),
      ),
    );
  }
}
