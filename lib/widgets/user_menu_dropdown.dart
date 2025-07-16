import 'package:flutter/material.dart';

class UserMenuDropdown extends StatelessWidget {
  const UserMenuDropdown({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton(
      itemBuilder: (context) => [
        const PopupMenuItem(
          child: Text('Profile'),
        ),
        const PopupMenuItem(
          child: Text('Account Settings'),
        ),
        const PopupMenuItem(
          child: Text('SOS'),
        ),
        const PopupMenuItem(
          child: Text('Admin Portal'),
        ),
        const PopupMenuItem(
          child: Text('Logout'),
        ),
      ],
      child: const CircleAvatar(
        child: Icon(Icons.person),
      ),
    );
  }
}
