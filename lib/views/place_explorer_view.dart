import 'package:flutter/material.dart';
import 'package:travel_buddy/models/place.dart';
import 'package:travel_buddy/widgets/place_card.dart';

class PlaceExplorerView extends StatelessWidget {
  const PlaceExplorerView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // In a real app, you would fetch this data from a service
    final places = [
      Place(
        id: '1',
        name: 'Place 1',
        address: '123 Main St',
        type: 'Restaurant',
        rating: 4.5,
        description: 'A great place to eat.',
        photoUrl: 'https://picsum.photos/300/200',
      ),
      Place(
        id: '2',
        name: 'Place 2',
        address: '456 Oak Ave',
        type: 'Park',
        rating: 4.8,
        description: 'A beautiful park to relax.',
        photoUrl: 'https://picsum.photos/300/200',
      ),
    ];

    return ListView.builder(
      itemCount: places.length,
      itemBuilder: (context, index) {
        return PlaceCard(place: places[index]);
      },
    );
  }
}
