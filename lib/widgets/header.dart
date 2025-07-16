import 'package:flutter/material.dart';
import 'package:travel_buddy/widgets/search_bar.dart';
import 'package:travel_buddy/widgets/user_menu_dropdown.dart';

class Header extends StatefulWidget {
  const Header({Key? key}) : super(key: key);

  @override
  State<Header> createState() => _HeaderState();
}

class _HeaderState extends State<Header> {
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    // In a real app, you would listen to a scroll controller
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: _isScrolled ? Colors.white : Colors.transparent,
        boxShadow: _isScrolled
            ? [
                const BoxShadow(
                  color: Colors.black12,
                  blurRadius: 10.0,
                  offset: Offset(0, 2),
                ),
              ]
            : [],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Text(
                'Travel Buddy',
                style: TextStyle(
                  fontSize: 24.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 32.0),
              // Desktop Navigation
              Row(
                children: [
                  _buildNavItem('Home'),
                  _buildNavItem('Places'),
                  _buildNavItem('Deals'),
                  _buildNavItem('Community'),
                  _buildNavItem('Itinerary'),
                  _buildNavItem('AI Plan'),
                ],
              ),
            ],
          ),
          const SizedBox(
            width: 400,
            child: SearchBar(),
          ),
          Row(
            children: [
              // In a real app, you would check if the user is logged in
              true
                  ? const UserMenuDropdown()
                  : Row(
                      children: [
                        TextButton(
                          onPressed: () {},
                          child: const Text('Login'),
                        ),
                        ElevatedButton(
                          onPressed: () {},
                          child: const Text('Sign Up'),
                        ),
                      ],
                    ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(String title) {
    return TextButton(
      onPressed: () {},
      child: Text(title),
    );
  }
}
